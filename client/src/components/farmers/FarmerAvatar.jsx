import { MediaAvatar } from "../media/Avatar";
import { farmerAvatars } from "../../lib/imagery";

export function FarmerAvatar({ initials, id, src, size = "lg" }) {
  const avatar = src || (id ? farmerAvatars[id] : undefined);
  return <MediaAvatar src={avatar} alt={initials} initials={initials} size={size} />;
}
