const filterData = (data, query) => {
  // filterData is a function that takes in data and query as parameters
  if (!query) {
    // if query is empty, return default data
    return data;
  }

  return data.filter((item) => {
    // if query is not empty, return filtered data
    const itemData = item.toLowerCase();
    const queryData = query.toLowerCase();
    return itemData.indexOf(queryData) > -1;
  });
};

export { filterData };
