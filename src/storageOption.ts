import type {Polygon} from "./getCandidates";
import type {storageOptions} from "../index";
import type { node } from "./nodes";

export abstract class storageOption{
    abstract findNodesNearPoint(latitude: number, longitude: number, searchRadius: number): Promise<Array<node>>;
    abstract findNodesInPolygon(polygon: Polygon): Promise<Array<node>>;
    abstract init(storageOptions: storageOptions): Promise<unknown>;
    abstract close(): Promise<unknown>;
}
