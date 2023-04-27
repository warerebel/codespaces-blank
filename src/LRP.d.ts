import type { node } from "./nodes";

export interface LRP {
    type: string,
    properties: {
        _bearing: number,
        _distanceToNext: number,
        _frc: number,
        _fow: number,
        _lfrcnp: number,
        _isLast: boolean,
        _longitude: number,
        _latitude: number,
        _sequenceNumber: number
    }
}

export interface LRPObject {
    openLRRef: string,
    type: string,
    properties: {
        _id: string,
        _locationType: number,
        _returnCode: number,
        _points: {
            type: string,
            properties: LRP[]
        },
        _offsets: {
            type: string,
            properties: {
                _pOffset: number,
                _nOffset: number,
                _version: number,
                _pOffRelative: number,
                _nOffRelative: number
            }
        }
    }
}

export interface decodedRoute {
    route: Array<{ 
        length: number; 
        linkid: string; 
    }> | null; 
    routeLength: number | null; 
    nodes: string[] | null; 
    openLRRef: string; 
    openLRDistance: number | null;
    failureReason: string | null;
}

export interface decodingProcess {
    LRP: LRPObject | null;
    candidateNodes: Array<Array<node>>;
    winningNodes: Array<string>;
}
