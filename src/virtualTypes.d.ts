import ObjectVirtualType from "./virtualTypes/object";
import LinkVirtualType from "./virtualTypes/pointer";
declare const VirtualTypes: {
    Link: typeof LinkVirtualType;
    Object: typeof ObjectVirtualType;
};
export default VirtualTypes;
