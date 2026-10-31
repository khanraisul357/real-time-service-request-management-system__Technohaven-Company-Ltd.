import { categoryMeta } from '../../utils/constants';
import Icon from '../common/Icon';

export default function EquipmentIcon({ category, size = 20 }) {
  return (
    <span className="equip-icon" title={categoryMeta(category).label}>
      <Icon name={categoryMeta(category).icon} size={size} />
    </span>
  );
}
