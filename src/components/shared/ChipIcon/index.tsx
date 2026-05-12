import { isImageUrl } from "../../../data/mockData";
import styles from "./ChipIcon.module.css";

interface Props {
  icon: string;
  name: string;
  size?: number;
}

export default function ChipIcon({ icon, name, size = 18 }: Props) {
  if (isImageUrl(icon)) {
    return (
      <img
        src={icon}
        alt={name}
        className={styles.img}
        style={{ width: size, height: size }}
        loading="lazy"
      />
    );
  }
  return <span className={styles.text}>{icon}</span>;
}
