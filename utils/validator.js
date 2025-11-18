
const emailValidator = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const passwordValidator = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+[\]{}|;:',.<>?]).{8,64}$/;
  return regex.test(password);
};

const nameValidator = (name) => {
  const regex = /^[A-Za-z\u0600-\u06FF\s'-]{2,50}$/;
  return regex.test(name?.trim());
};


const phoneValidator = (phoneNumber) => {
  const regex =  /^(?:\+971|0)?5[024568]\d{7}$/;
  return regex.test(phoneNumber);
};

export { emailValidator, passwordValidator, nameValidator, phoneValidator };
