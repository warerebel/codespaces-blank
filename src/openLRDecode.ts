import { getLRP } from "./decodeLRP";
import { getCandidatesForLRP, getNodesForGraph } from "./getCandidates";
import { chooseWinningNodes } from "./chooseWinningNodes";
import { buildLinkLookups, getGraph } from "./graph";
import type { linkLookup, node } from "./nodes";
import type { LRPObject, LRP, decodedRoute, decodingProcess } from "./LRP";
import type Graph from "node-dijkstra";

type PathResult = {
    path: string,
    cost: number
}

export interface OpenLRDecodeOptions {
    searchRadius?: number | undefined;
    targetBearing?: number | undefined;
}

export async function decodeOpenLRReference(openLRRef: string, options: OpenLRDecodeOptions): Promise<decodedRoute> {
    try {
        const decodingProgress: decodingProcess = {
            LRP: null,
            candidateNodes: [],
            winningNodes: []
        };
        decodingProgress.LRP = getLRP(openLRRef);
        const distance = decodingProgress.LRP.properties._points.properties.reduce(getLRPObjectLength, 0);
        const decodingProgressWithNodes = await getWinningNodes(decodingProgress, options);
        if (decodingProgressWithNodes.winningNodes.length > 1) {
            const graph = await buildGraph(decodingProgress.LRP);
            const path = getPath(decodingProgressWithNodes.winningNodes as string[], graph.graph);
            const route = getRoute(path.path, graph.linklookup);
            return { route: route, nodes: path.path, routeLength: path.cost, openLRRef: openLRRef, openLRDistance: distance, failureReason: null };
        }
    }
    catch (error) {
        if (error instanceof Error)
            return { route: null, nodes: null, routeLength: null, openLRRef: openLRRef, openLRDistance: null, failureReason: error.message };
    }
    return { route: null, nodes: null, routeLength: null, openLRRef: openLRRef, openLRDistance: null, failureReason: null };
}

function getLRPObjectLength(prev: number, cur: LRP) {
    return prev + cur.properties._distanceToNext;
}

async function getWinningNodes(decodingProgress: decodingProcess, options: OpenLRDecodeOptions) {
    if (decodingProgress.LRP !== null) {
        decodingProgress.candidateNodes = await getCandidatesForLRP(decodingProgress.LRP, options.searchRadius);
        decodingProgress.winningNodes = chooseWinningNodes(decodingProgress, options.targetBearing);
    }
    return decodingProgress;
}

async function buildGraph(decodedOpenLR: LRPObject) {
    const nodesForGraph = await getNodesForGraph(decodedOpenLR);
    const lfrc = decodedOpenLR.properties._points.properties.reduce((pre, lrp) => lrp.properties._lfrcnp > pre ? lrp.properties._lfrcnp : pre, 0);
    const lookups = buildLinkLookups(nodesForGraph as unknown as node[], lfrc);
    const graph = getGraph(lookups.graphInput);
    return { graph: graph, linklookup: lookups.links };
}

function getPath(nodes: string[], graph: Graph) {
    const paths = [];
    for (let i = 0; i < (nodes.length - 1); i++) {
        paths.push(graph.path(nodes[i], nodes[i + 1], { cost: true }) as unknown as PathResult);
    }
    const result = { path: [] as string[], cost: 0 };
    for (const index in paths) {
        if (paths[index].path === null) {
            result.path = [];
            result.cost = 0;
            break;
        }
        result.path = result.path.concat(paths[index].path);
        result.cost += paths[index].cost;
    }
    return result;
}

function getRoute(routes: string[], linkLookup: linkLookup) {
    const result = [];
    for (let i = 0; i < (routes.length - 1); i++) {
        if (routes[i] !== routes[i + 1]) {
            const link = linkLookup[routes[i]][routes[i + 1]];
            result.push(link);
        }
    }
    return result;
}

