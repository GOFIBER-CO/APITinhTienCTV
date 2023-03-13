


const filter = ["\n", " ", ""];
function getNumberOfWord(body = {}, image = {}) {
  if (!body) {
    return { number_word: 0, number_image: 0 };
  } else {
    let number_word = 0;
    let number_image = 0;

    let content = body?.content;
    content?.map((value) => {
      if(value?.table){
        value.table?.tableRows?.map(itemRow =>{
          itemRow?.tableCells?.map(itemCell =>{
            itemCell?.content[0]?.paragraph?.elements?.map((item) => {
              number_word =
                number_word +
                (item?.textRun?.content
                  ?.split(" ")
                  ?.filter((i) => i !== "\n" && i !== "" )?.length || 0);
            });
          })
        })
      }
      value?.paragraph?.elements?.map((item) => {
        number_word =
          number_word +
          (item?.textRun?.content
            ?.split(" ")
            ?.filter((i) => i !== "\n" && i !== "" && i !== " ")?.length || 0);
      });
    });
    number_image =
      Object.keys(image).length - 1 >= 0 ? Object.keys(image).length - 1 : 0;
    return { number_word, number_image };
  }
}

console.log(getNumberOfWord(a.body))

module.exports = getNumberOfWord;
