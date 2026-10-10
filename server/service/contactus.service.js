import { ValidationError } from '../exception/AppError.js';
import { createContactUs } from '../repository/contactus.repository.js';

const createContact = async (data) => {
  if(!data.email || !data.message || !data.name) throw new ValidationError("Either Name or email or message is missing");
  const result = await createContactUs(data);
  return result;
};

export { createContact };
