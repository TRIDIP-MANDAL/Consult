import { countries } from "../../assets/data/country_dialCode.json";

interface PhoneInputProps {
  phoneValue: string;
  cntryCodeValue: string; // the country.code used as select value
  onPhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // fires with a synthetic-like event so parent handleChange still works
  onCountryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  phoneName?: string;
  selectName?: string;
  phoneRequired?: boolean;
  selectRequired?: boolean;
  // Tailwind classes injected from parent so each page keeps its own style
  selectClassName?: string;
  inputClassName?: string;
}

// Reusable country-dial-code + phone number pair.
// Both inputs expose the same name attributes as before so parent onChange handlers work unchanged.
const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneValue,
  cntryCodeValue,
  onPhoneChange,
  onCountryChange,
  phoneName = "phone",
  selectName = "cntry_dial_code",
  phoneRequired = false,
  selectRequired = false,
  selectClassName = "",
  inputClassName = "",
}) => {
  return (
    <div className="flex gap-2">
      <select
        name={selectName}
        value={cntryCodeValue}
        onChange={onCountryChange}
        required={selectRequired}
        className={selectClassName}
      >
        <option value="" disabled>Code</option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.code} ({country.dial_code})
          </option>
        ))}
      </select>
      <input
        type="text"
        name={phoneName}
        value={phoneValue}
        onChange={onPhoneChange}
        placeholder="Phone number"
        required={phoneRequired}
        className={inputClassName}
      />
    </div>
  );
};

export default PhoneInput;
