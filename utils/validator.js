const emailValidator = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const passwordValidator = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+[\]{}|;:',.<>?]).{8,64}$/;
  return regex.test(password);
};

const nameValidator = (name) => {
  return typeof name === "string" && name.trim().length >= 2 && name.trim().length <= 50;
};

const phoneValidator = (phone) => {
  phone = phone.replace(/[\s-()]/g, "");

  const regex = /^(?:\+971|00971|0)?(?:(?:50|52|54|55|56|58)\d{7} |(?:2|3|4|6|7|9)\d{7} |(?:600|800|900)\d{4,6})$/x;

  return regex.test(phone);
};

export { emailValidator, passwordValidator, nameValidator, phoneValidator };
