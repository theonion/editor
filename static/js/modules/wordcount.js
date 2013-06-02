function _stats() {
    var text = $(editor)[0].innerText;
    wordcount = rawtext.split(/\s+/).length;
    return {
        wordcount: wordcount,
        characters: text.length,
        readingtime: wordcount / 225
    }
}