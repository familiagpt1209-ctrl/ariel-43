export const STREET={moving:11.5,parking:14.8,center:13,width:7,roadEdge:5,building:26};
export function hasSideStreet(district,side){return !(district==='coast'&&side>0)&&!(['industrial','metro'].includes(district)&&side<0);}
export function isJunction(segment){return segment.type==='intersection'||segment.transition==='entry';}
export function junctionAt(segments,z,margin=0){return segments.items.some(s=>isJunction(s)&&Math.abs(z-(s.z-10))<6+margin);}

export function trafficZ(distance,time,phase,side,parked){const travel=distance+(parked?0:time*(side>0?8:-6));return ((travel+phase)%360+360)%360-325;}

// Check the whole vehicle, including the portion ahead of its origin.
export function supportedSpan(distance,z,minZ,maxZ,seed,districtAt,supports){return supports(districtAt(distance-z-minZ,seed))&&supports(districtAt(distance-z-maxZ,seed));}
