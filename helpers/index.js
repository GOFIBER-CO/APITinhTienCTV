const USER_STATUS = {
  ACTIVE: 1,
  DEACTIVATED: 2,
};

const LINK_STATUS = {
  POSTED: 1,
  PENDING: 2,
};

const OWNER_CONFIRM = {
  CONFIRMED: 1,
  PENDING: 2,
};

const PRICE = 60;

const genFieldsRequire = (data) => {
  let description = "";

  (Object.keys(data) || []).forEach((key) => {
    if (data[`${key}`] === undefined) description += `${key} `;
  });

  return `${description}: Required`;
};

module.exports = {
  USER_STATUS,
  LINK_STATUS,
  OWNER_CONFIRM,
  PRICE,
  genFieldsRequire,
};
