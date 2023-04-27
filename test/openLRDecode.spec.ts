import * as openlrJS from "openlr-js";
import {decodeOpenLRReference, OpenLRDecodeOptions} from "../src/openLRDecode";
import * as assert from "assert";
import * as sinon from "sinon";
import {configureStorage} from "../src/storage";
import type { node } from "../src/nodes";

import routeOneCandidateNodesOne from "./resources/routeOneCandidateNodesOne.json";
import routeOneCandidateNodesTwo from "./resources/routeOneCandidateNodesTwo.json";
import routeTwoCandidateNodesOne from "./resources/routeTwoCandidateNodesOne.json";
import routeTwoCandidateNodesTwo from "./resources/routeTwoCandidateNodesTwo.json";
import routeTwoCandidateNodesThree from "./resources/routeTwoCandidateNodesThree.json";
import routeOneLRP from "./resources/routeOneLRP.json";
import routeOneLRPnoFRC from "./resources/routeOneLRPnoFRC.json";
import routeTwoLRP from "./resources/routeTwoLRP.json";
import badRouteLRP from "./resources/badRouteLRP.json";
import badFOWLRP from "./resources/badFOWLRP.json";
import allNodes from "./resources/fullMap.json";
import targetPathOne from "./resources/targetPathOne.json";
import targetPathTwo from "./resources/targetPathTwo.json";
import targetPathThree from "./resources/targetPathThree.json";

describe("openLRDecode", function(){

    describe("decodeOpenLRReference", function(){

        before(function(){
            // decode any openLRRef to our predefined openLR objects
            const lrpDecodeStub = sinon.stub(openlrJS.Serializer, "serialize");
            lrpDecodeStub.onCall(0).returns(routeOneLRP);
            lrpDecodeStub.onCall(1).returns(routeOneLRPnoFRC);
            lrpDecodeStub.onCall(2).returns(routeTwoLRP);
            lrpDecodeStub.onCall(3).returns(badRouteLRP);
            lrpDecodeStub.onCall(4).returns(badFOWLRP);

            // Simulate geo-lookup of nodes from storage
            const findStub = sinon.stub(configureStorage, "findNodesNearPoint");
            findStub.onCall(0).resolves(routeOneCandidateNodesOne as node[]);
            findStub.onCall(1).resolves(routeOneCandidateNodesTwo as node[]);
            findStub.onCall(2).resolves(routeOneCandidateNodesOne as node[]);
            findStub.onCall(3).resolves(routeOneCandidateNodesTwo as node[]);
            findStub.onCall(4).resolves(routeTwoCandidateNodesOne as node[]);
            findStub.onCall(5).resolves(routeTwoCandidateNodesTwo as node[]);
            findStub.onCall(6).resolves(routeTwoCandidateNodesThree as node[]);
            findStub.onCall(7).resolves(routeOneCandidateNodesTwo as node[]);
            findStub.onCall(8).resolves(routeOneCandidateNodesOne as node[]);
            findStub.onCall(9).resolves(routeOneCandidateNodesOne as node[]);
            findStub.onCall(10).resolves(routeOneCandidateNodesTwo as node[]);
            
            // Simulate geo-lookup of all nodes in LRP polygon
            sinon.stub(configureStorage, "findNodesInPolygon").resolves(allNodes as node[]);
        });

        it("decodes an openLRRef with lfrc to a route of linkids", async function(){
            const openLRRef = "C/+ASyT5EAogGPylBIAKP9DK4RZfCjsf9l8BwAwP";
            const options: OpenLRDecodeOptions = {targetBearing: 10, searchRadius: 50};
            const result = await decodeOpenLRReference(openLRRef, options);
            const compare: string[] = [];
            for(const link of result.route as Array<{linkid: string}>)
                compare.push(link.linkid);
            assert.deepStrictEqual(compare, targetPathOne.path);
        });

        it("decodes an openLRRef without lfrc to a route of links", async function(){
            const openLRRef = "C/+ASyT5EAogGPylBIAKP9DK4RZfCjsf9l8BwAwP";
            const options: OpenLRDecodeOptions = {targetBearing: 10, searchRadius: 50};
            const result = await decodeOpenLRReference(openLRRef, options);
            const compare: string[] = [];
            for(const link of result.route as Array<{linkid: string}>)
                compare.push(link.linkid);
            assert.deepStrictEqual(compare, targetPathTwo.path);
        });

        it("decodes an openLRRef with SC links", async function(){
            const openLRRef = "C/+ASyT5EAogGPylBIAKP9DK4RZfCjsf9l8BwAwP";
            const options: OpenLRDecodeOptions = {targetBearing: 10, searchRadius: 50};
            const result = await decodeOpenLRReference(openLRRef, options);
            const compare: string[] = [];
            for(const link of result.route as Array<{linkid: string}>)
                compare.push(link.linkid);
            assert.deepStrictEqual(compare, targetPathThree.path);
        });

        it("fails to decode an LRP with no navigable route", async function(){
            const openLRRef = "C/+ASyT5EAogGPylBIAKP9DK4RZfCjsf9l8BwAwP";
            const options: OpenLRDecodeOptions = {targetBearing: 10, searchRadius: 50};
            const result = await decodeOpenLRReference(openLRRef, options);
            assert.deepStrictEqual(result.route, null);
        });

        it("retries matching exluding fow if no winning candidates are found", async function(){
            const openLRRef = "C/+ASyT5EAogGPylBIAKP9DK4RZfCjsf9l8BwAwP";
            const options: OpenLRDecodeOptions = {targetBearing: 10, searchRadius: 50};
            const result = await decodeOpenLRReference(openLRRef, options);
            const compare: string[] = [];
            for(const link of result.route as Array<{linkid: string}>)
                compare.push(link.linkid);
            assert.deepStrictEqual(compare, targetPathOne.path);
        });

    });

});
