import { Input } from '../ui/input';
import Field from './Field';

const NumField = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => {
  const num = (v: string) => (v === "" ? 0 : Number(v));

  
  
    return (
      <Field label={label}>
        <Input
          type="number"
          min={0}
          step="any"
          value={value || ""}
          onChange={(e) => onChange(num(e.target.value))}
        />
      </Field>
    );
  


}

export default NumField