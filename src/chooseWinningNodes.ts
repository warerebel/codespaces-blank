import type { LRP, decodingProcess } from "./LRP";
import type { node, nodeChildLink } from "./nodes";
import { checkFow, checkBearing } from "./checkLinkProperties";

export function chooseWinningNodes(decodingProgress: decodingProcess, targetBearing = 25) {
    decodingProgress.winningNodes = [];
    for (const LRPNodes in decodingProgress.candidateNodes) {
        if (decodingProgress.LRP !== null) {
            const LRP = decodingProgress.LRP.properties._points.properties[parseInt(LRPNodes)];
            for (const node in decodingProgress.candidateNodes[parseInt(LRPNodes)]) {
                const candidateNode = decodingProgress.candidateNodes[parseInt(LRPNodes)][node];
                const result = checkCandidateNode(LRP, candidateNode, targetBearing);
                if (result.won) {
                    decodingProgress.winningNodes.push(result.node);
                    break;
                }
            }
        }
    }
    return decodingProgress.winningNodes;
}

function checkCandidateNode(LRP: LRP, node: node, targetBearing: number) {
    if (!LRP.properties._isLast) {
        for (const linkNo in node.startLinks) {
            if (checkLink(node.startLinks[linkNo], LRP, targetBearing, false))
                return { won: true, node: node.startLinks[linkNo].startnode };
        }
        for (const linkNo in node.startLinks) {
            if (checkLink(node.startLinks[linkNo], LRP, targetBearing, true))
                return { won: true, node: node.startLinks[linkNo].startnode };
        }
    } else {
        for (const linkNo in node.endLinks) {
            if (checkLink(node.endLinks[linkNo], LRP, targetBearing, false))
                return { won: true, node: node.endLinks[linkNo].endnode };
        }
        for (const linkNo in node.endLinks) {
            if (checkLink(node.endLinks[linkNo], LRP, targetBearing, true))
                return { won: true, node: node.endLinks[linkNo].endnode };
        }
    }
    return { won: false, node: "" };
}

function checkLink(link: nodeChildLink, LRP: LRP, targetBearing: number, skipFOW = false) {
    if (skipFOW || checkFow(link.fow, LRP.properties._fow)) {
        if (checkBearing(link.bearing, LRP.properties._bearing, targetBearing)) {
            if (link.frc <= LRP.properties._frc)
                return true;
        }
    }
    return false;
}
