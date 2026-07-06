import { isValidPhoneNumber, type CountryCode, parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Validates whether the given string is a properly formatted email address.
 * @param email - The email string to validate
 * @returns `true` if it IS a valid email, `false` if it is NOT
 * Usage: if (isValidEmail(email)) { proceed }
 */
const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validates whether the given string is a valid mobile number for any country.
 * The number should ideally be in international format (e.g., +12133734253 or +919876543210).
 * @param num - The phone number string to validate
 * @returns `true` if it's a valid phone number, `false` otherwise
 */
const isValidMobileNo = (num: string, cntryCode:CountryCode): boolean => { 
   try {
       return isValidPhoneNumber(num, cntryCode);
   } catch (error) {
       return false;
   }
}


const formatMobileNo = (num: string, cntryCode:CountryCode):string =>{
    try{
       return parsePhoneNumberFromString(num,cntryCode)?.format('E.164')||"";
    }
    catch(error){
      return "";
    }
}
    
/**
 * Validates whether the given password meets strong security criteria.
 * Criteria: >= 6 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.
 * @param password - The password string to validate
 * @returns `true` if strong, `false` otherwise
 */
const isStrongPassword = (password: string): boolean => {
    // (?=.*[a-z])        : At least one lowercase letter
    // (?=.*[A-Z])        : At least one uppercase letter
    // (?=.*\d)           : At least one digit
    // (?=.*[^A-Za-z0-9]) : At least one special character (anything not alphanumeric)
    // .{6,}              : Minimum 6 characters long
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;
    return strongPasswordRegex.test(password);
}

const purifyObject = (obj:any):void=>{  // still now it is not used
   Object.keys(obj).forEach((key)=>{
    if(obj[key] === "") delete obj[key];
 })
}
export { isValidEmail, isValidMobileNo, formatMobileNo, isStrongPassword, purifyObject, type CountryCode };