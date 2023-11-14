const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize() {
  return new Promise((resolve, reject) => {
    sets = setData.map(set => {
      const theme = themeData.find(theme => theme.id === set.theme_id);
      if (theme) {
        return { ...set, theme: theme.name };
      }
      return set;
    });
    resolve();
  });
}

function getAllSets() {
  return new Promise((resolve, reject) => {
    if (sets.length > 0) {
      resolve(sets);
    } else {
      reject("No sets available");
    }
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const foundSet = sets.find(set => set.set_num === setNum);
    if (foundSet) {
      resolve(foundSet);
    } else {
      reject("Unable to find requested set");
    }
  });
}

function getSetsByTheme(theme) {
  return new Promise((resolve, reject) => {
      const matchingSets = sets.filter(set => {
           return set.theme.toLowerCase().includes(theme.toLowerCase());
      });
      if (matchingSets.length > 0) {
          resolve(matchingSets);
      } else {
          reject("Unable to find requested sets");
      }
  });
}


module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };