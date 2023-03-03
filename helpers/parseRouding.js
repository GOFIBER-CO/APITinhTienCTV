const parseRounding = (value) => {
  let a = value % 1000 === 0 ? value / 1000 : parseInt(value / 1000 + 1);
  return a * 1000;
};

parseRounding(250);
module.exports = parseRounding;
