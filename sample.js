const sample = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve("sample");
    }, 1000);
  });
console.log("Loading");

const main = async () => {
  const result = await sample();
  console.log(result);
};
main();
