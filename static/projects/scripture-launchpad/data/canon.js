/* Scripture Launchpad — canon structure for OT / NT / D&C / PGP.
   Skeleton book lists: names + chapter/section counts + one-line blurbs.
   The Book of Mormon ships as fully authored part files. */
window.SLP = window.SLP || { books: [], gloss: [] };

/* ---------- OLD TESTAMENT (39) ---------- */
SLP.books.push({ volume:"ot", id:"gen",   title:"Genesis",     chapterCount:50,  blurb:"Creation, the fall, the flood, the patriarchs." });
SLP.books.push({ volume:"ot", id:"ex",    title:"Exodus",      chapterCount:40,  blurb:"Moses, the plagues, the exodus, Sinai." });
SLP.books.push({ volume:"ot", id:"lev",   title:"Leviticus",   chapterCount:27,  blurb:"Law, sacrifice, and ritual purity." });
SLP.books.push({ volume:"ot", id:"num",   title:"Numbers",     chapterCount:36,  blurb:"Israel's census and wilderness years." });
SLP.books.push({ volume:"ot", id:"deut",  title:"Deuteronomy", chapterCount:34,  blurb:"Moses' farewell law and covenant." });
SLP.books.push({ volume:"ot", id:"josh",  title:"Joshua",      chapterCount:24,  blurb:"Conquest and settlement of Canaan." });
SLP.books.push({ volume:"ot", id:"judg",  title:"Judges",      chapterCount:21,  blurb:"Deliverers raise up a wayward Israel." });
SLP.books.push({ volume:"ot", id:"ruth",  title:"Ruth",        chapterCount:4,   blurb:"Loyalty and redemption in Bethlehem." });
SLP.books.push({ volume:"ot", id:"1-sam", title:"1 Samuel",    chapterCount:31,  blurb:"Samuel, Saul, and the rise of David." });
SLP.books.push({ volume:"ot", id:"2-sam", title:"2 Samuel",    chapterCount:24,  blurb:"David's reign and its costs." });
SLP.books.push({ volume:"ot", id:"1-kgs", title:"1 Kings",     chapterCount:22,  blurb:"Solomon's temple; the kingdom divides." });
SLP.books.push({ volume:"ot", id:"2-kgs", title:"2 Kings",     chapterCount:25,  blurb:"Decline, prophets, and two exiles." });
SLP.books.push({ volume:"ot", id:"1-chr", title:"1 Chronicles",chapterCount:29,  blurb:"Genealogies to David's reign retold." });
SLP.books.push({ volume:"ot", id:"2-chr", title:"2 Chronicles",chapterCount:36,  blurb:"The temple and kings of Judah." });
SLP.books.push({ volume:"ot", id:"ezra",  title:"Ezra",        chapterCount:10,  blurb:"Return from exile; temple rebuilt." });
SLP.books.push({ volume:"ot", id:"neh",   title:"Nehemiah",    chapterCount:13,  blurb:"Jerusalem's walls and covenant renewal." });
SLP.books.push({ volume:"ot", id:"esth",  title:"Esther",      chapterCount:10,  blurb:"A queen saves her people." });
SLP.books.push({ volume:"ot", id:"job",   title:"Job",         chapterCount:42,  blurb:"Suffering, friends, and God's answer." });
SLP.books.push({ volume:"ot", id:"ps",    title:"Psalms",      chapterCount:150, blurb:"Israel's songbook of prayer and praise." });
SLP.books.push({ volume:"ot", id:"prov",  title:"Proverbs",    chapterCount:31,  blurb:"Wisdom for ordinary life." });
SLP.books.push({ volume:"ot", id:"eccl",  title:"Ecclesiastes",chapterCount:12,  blurb:"The teacher weighs life's meaning." });
SLP.books.push({ volume:"ot", id:"song",  title:"Song of Solomon",chapterCount:8,   blurb:"A wedding poem of love and devotion." });
SLP.books.push({ volume:"ot", id:"isa",   title:"Isaiah",      chapterCount:66,  blurb:"Judgment, comfort, and the Messiah." });
SLP.books.push({ volume:"ot", id:"jer",   title:"Jeremiah",    chapterCount:52,  blurb:"Jerusalem's fall foretold and mourned." });
SLP.books.push({ volume:"ot", id:"lam",   title:"Lamentations",chapterCount:5,   blurb:"Grief poems after Jerusalem's fall." });
SLP.books.push({ volume:"ot", id:"ezek",  title:"Ezekiel",     chapterCount:48,  blurb:"Visions in exile; dry bones live." });
SLP.books.push({ volume:"ot", id:"dan",   title:"Daniel",      chapterCount:12,  blurb:"Faith in Babylon; dreams and kings." });
SLP.books.push({ volume:"ot", id:"hosea", title:"Hosea",       chapterCount:14,  blurb:"A prophet's marriage as mercy's parable." });
SLP.books.push({ volume:"ot", id:"joel",  title:"Joel",        chapterCount:3,   blurb:"Locusts, repentance, and the Spirit." });
SLP.books.push({ volume:"ot", id:"amos",  title:"Amos",        chapterCount:9,   blurb:"Justice weighed against a rich nation." });
SLP.books.push({ volume:"ot", id:"obad",  title:"Obadiah",     chapterCount:1,   blurb:"Edom judged; Zion restored." });
SLP.books.push({ volume:"ot", id:"jonah", title:"Jonah",       chapterCount:4,   blurb:"A runaway prophet and Nineveh." });
SLP.books.push({ volume:"ot", id:"micah", title:"Micah",       chapterCount:7,   blurb:"Justice, mercy, a Bethlehem ruler." });
SLP.books.push({ volume:"ot", id:"nahum", title:"Nahum",       chapterCount:3,   blurb:"Nineveh's empire falls." });
SLP.books.push({ volume:"ot", id:"hab",   title:"Habakkuk",    chapterCount:3,   blurb:"Questions to God, answered by faith." });
SLP.books.push({ volume:"ot", id:"zeph",  title:"Zephaniah",   chapterCount:3,   blurb:"A remnant sings after judgment." });
SLP.books.push({ volume:"ot", id:"hag",   title:"Haggai",      chapterCount:2,   blurb:"Rebuild the house first." });
SLP.books.push({ volume:"ot", id:"zech",  title:"Zechariah",   chapterCount:14,  blurb:"Visions of restoration and the King." });
SLP.books.push({ volume:"ot", id:"mal",   title:"Malachi",     chapterCount:4,   blurb:"Covenant questions; Elijah's return." });

/* ---------- NEW TESTAMENT (27) ---------- */
SLP.books.push({ volume:"nt", id:"matt",   title:"Matthew",         chapterCount:28, blurb:"Jesus as the promised Messiah-king." });
SLP.books.push({ volume:"nt", id:"mark",   title:"Mark",            chapterCount:16, blurb:"A fast-moving account of Jesus' ministry." });
SLP.books.push({ volume:"nt", id:"luke",   title:"Luke",            chapterCount:24, blurb:"An ordered life of Jesus and the Church's start." });
SLP.books.push({ volume:"nt", id:"john",   title:"John",            chapterCount:21, blurb:"Signs and discourses reveal the Christ." });
SLP.books.push({ volume:"nt", id:"acts",   title:"Acts",            chapterCount:28, blurb:"The Spirit sends the Church to the world." });
SLP.books.push({ volume:"nt", id:"rom",    title:"Romans",          chapterCount:16, blurb:"Grace, faith, and Israel's story." });
SLP.books.push({ volume:"nt", id:"1-cor",  title:"1 Corinthians",   chapterCount:16, blurb:"Ordering a troubled congregation." });
SLP.books.push({ volume:"nt", id:"2-cor",  title:"2 Corinthians",   chapterCount:13, blurb:"Paul defends his ministry." });
SLP.books.push({ volume:"nt", id:"gal",    title:"Galatians",       chapterCount:6,  blurb:"Freedom from the law of Moses." });
SLP.books.push({ volume:"nt", id:"eph",    title:"Ephesians",       chapterCount:6,  blurb:"The Church as one household." });
SLP.books.push({ volume:"nt", id:"philip", title:"Philippians",     chapterCount:4,  blurb:"Joy and humility in chains." });
SLP.books.push({ volume:"nt", id:"col",    title:"Colossians",      chapterCount:4,  blurb:"The supremacy of Christ." });
SLP.books.push({ volume:"nt", id:"1-thes", title:"1 Thessalonians", chapterCount:5,  blurb:"Hope in the Lord's coming." });
SLP.books.push({ volume:"nt", id:"2-thes", title:"2 Thessalonians", chapterCount:3,  blurb:"Steadiness before that day." });
SLP.books.push({ volume:"nt", id:"1-tim",  title:"1 Timothy",       chapterCount:6,  blurb:"Leadership and sound teaching." });
SLP.books.push({ volume:"nt", id:"2-tim",  title:"2 Timothy",       chapterCount:4,  blurb:"Paul's last charge to a son." });
SLP.books.push({ volume:"nt", id:"titus",  title:"Titus",           chapterCount:3,  blurb:"Good works adorn sound doctrine." });
SLP.books.push({ volume:"nt", id:"philem", title:"Philemon",        chapterCount:1,  blurb:"A plea for a forgiven brother." });
SLP.books.push({ volume:"nt", id:"heb",    title:"Hebrews",         chapterCount:13, blurb:"Christ, the better high priest." });
SLP.books.push({ volume:"nt", id:"james",  title:"James",           chapterCount:5,  blurb:"Faith shown in works." });
SLP.books.push({ volume:"nt", id:"1-pet",  title:"1 Peter",         chapterCount:5,  blurb:"Hope and holiness in trial." });
SLP.books.push({ volume:"nt", id:"2-pet",  title:"2 Peter",         chapterCount:3,  blurb:"Grow in knowledge; the day comes." });
SLP.books.push({ volume:"nt", id:"1-john", title:"1 John",          chapterCount:5,  blurb:"God is light and love." });
SLP.books.push({ volume:"nt", id:"2-john", title:"2 John",          chapterCount:1,  blurb:"Walk in truth; watch deception." });
SLP.books.push({ volume:"nt", id:"3-john", title:"3 John",          chapterCount:1,  blurb:"Hospitality and a rebuke." });
SLP.books.push({ volume:"nt", id:"jude",   title:"Jude",            chapterCount:1,  blurb:"Contend for the faith." });
SLP.books.push({ volume:"nt", id:"rev",    title:"Revelation",      chapterCount:22, blurb:"Visions of the last days and Zion." });

/* ---------- DOCTRINE & COVENANTS (3) ---------- */
SLP.books.push({ volume:"dc", id:"dc",   title:"Doctrine & Covenants",    chapterCount:138, unit:"section", blurb:"Revelations mostly to Joseph Smith, 1828-1844." });
SLP.books.push({ volume:"dc", id:"od-1", title:"Official Declaration 1",  chapterCount:1,   unit:"section", blurb:"Ending plural marriage, 1890." });
SLP.books.push({ volume:"dc", id:"od-2", title:"Official Declaration 2",  chapterCount:1,   unit:"section", blurb:"Priesthood for all worthy members, 1978." });

/* ---------- PEARL OF GREAT PRICE (5) ---------- */
SLP.books.push({ volume:"pgp", id:"moses",  title:"Moses",                 chapterCount:8, blurb:"Selections from Genesis and the vision of Enoch." });
SLP.books.push({ volume:"pgp", id:"abr",    title:"Abraham",               chapterCount:5, blurb:"Abraham's visions, covenant, and creation account." });
SLP.books.push({ volume:"pgp", id:"js-m",   title:"Joseph Smith—Matthew",  chapterCount:1, blurb:"A retranslation of Matthew 24 on the last days." });
SLP.books.push({ volume:"pgp", id:"js-h",   title:"Joseph Smith—History",  chapterCount:1, blurb:"The First Vision and coming forth of the Book of Mormon." });
SLP.books.push({ volume:"pgp", id:"a-of-f", title:"Articles of Faith",     chapterCount:1, unit:"article", blurb:"Thirteen short statements of belief." });
