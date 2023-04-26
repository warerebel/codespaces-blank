import * as openlrJS from "openlr-js";
import type {LRPObject} from "./LRP";

export function getLRP(openLrString: string): LRPObject{
    const binaryDecoder = new openlrJS.BinaryDecoder();
    const openLrBinary = Buffer.from(openLrString, "base64");
    const locationReference = openlrJS.LocationReference.fromIdAndBuffer("binary", openLrBinary);
    const rawLocationReference = binaryDecoder.decodeData(locationReference);
    const LRPObject = openlrJS.Serializer.serialize(rawLocationReference);
    LRPObject.openLRRef = openLrString;
    if(LRPObject.type === "RawInvalidLocationReference")
        throw new Error("Invalid OpenLR string");
    return LRPObject;
}
