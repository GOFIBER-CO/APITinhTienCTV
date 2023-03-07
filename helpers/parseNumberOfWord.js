const filter = ["\n", " ", ""];
function getNumberOfWord(body = {}, image = {}) {
  if (!body) {
    return { number_word: 0, number_image: 0 };
  } else {
    let number_word = 0;
    let number_image = 0;

    let content = body?.content;
    content?.map((value) => {
      value?.paragraph?.elements?.map((item) => {
        // number_word =
        //   number_word +
        //   (item?.textRun?.content
        //     ?.split(" ")
        //     ?.filter((i) => i !== "\n" && i !== "" && i !== " ")?.length || 0);
        let words =
          item.textRun && item.textRun.content
            ? item.textRun.content
                .replace(/(\s+|-|\n)+/g, " ")
                .trim()
                .split(/[\s/-]/)
            : [];
        console.log(words, "asdasd");
        number_word =
          number_word +
          words.filter((item) => !["", ",", ".", "-"].includes(item.trim()))
            .length;
      });
    });
    number_image =
      Object.keys(image).length - 1 >= 0 ? Object.keys(image).length - 1 : 0;
    return { number_word, number_image };
  }
}

getNumberOfWord();

module.exports = getNumberOfWord;
