import type {MongoClient, Db} from "mongodb";
import type {Polygon} from "./getCandidates";
import {storageOption} from "./storageOption";
import type {storageOptions} from "../index";
import type { node } from "./nodes";

/* istanbul ignore file */

export class Mongo extends storageOption{

    static client: MongoClient;
    static db: Db;

    constructor(){
        super();
    }

    override async init(options: storageOptions){
        const url = this.getURL(options);
        const mongodb = await import("mongodb");
        Mongo.client = new mongodb.MongoClient(url);
        await Mongo.client.connect();
        Mongo.db = Mongo.client.db(options.dbName);
        return Mongo.client;
    }

    getURL(options: storageOptions){
        if(options.username && options.password){
            if(!options.authMechanism)
                options.authMechanism = "DEFAULT";
            return `mongodb://${options.username}:${options.password}@${options.url}/?authMechanism=${options.authMechanism}`;
        } else {
            return `mongodb://${options.url}`;
        }
    }

    override async findNodesNearPoint(latitude: number, longitude: number, searchRadius: number): Promise<Array<node>> {
        const collection = Mongo.db.collection("nodes");
        return collection.find({
            geometry: {
                $near:{
                    $geometry: { type: "Point",  coordinates: [longitude, latitude] },
                    $minDistance: 0,
                    $maxDistance: searchRadius
                }
            }
        }).toArray() as unknown as Array<node>;
    }

    override async findNodesInPolygon(polygon: Polygon): Promise<Array<node>> {
        const collection = Mongo.db.collection("nodes");
        return collection.find({
            geometry: {
                $geoWithin: {
                    $geometry: polygon
                }
            }
        }).toArray() as unknown as Array<node>;
    }

    override async close(): Promise<unknown> {
        return Mongo.client.close();
    }
}
