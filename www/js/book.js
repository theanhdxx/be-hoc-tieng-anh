/* ===== Học theo sách Tiếng Anh 1 (Global Success) =====
   Chỉ dùng danh sách chữ cái / từ / mẫu câu của từng Unit; lời thoại, hình và cách chơi là của app.
   w: [từ, emoji, nghĩa]   s: [câu mẫu, nghĩa, từ khóa để chấm]   */

const BOOK_UNITS = [
  { n: 1, L: 'B', place: 'Ở sân trường', en: 'In the school playground',
    w: [['Bill', '👦', 'bạn Bill'], ['ball', '⚽', 'quả bóng'], ['bike', '🚲', 'xe đạp'], ['book', '📖', 'quyển sách']],
    s: [["Hi, I'm Bill.", 'Chào, mình là Bill.', 'bill'], ['Hi, Bill.', 'Chào Bill.', 'hi'], ['Bye, Bill.', 'Tạm biệt Bill.', 'bye']] },
  { n: 2, L: 'C', place: 'Ở phòng ăn', en: 'In the dining room',
    w: [['cake', '🍰', 'bánh ngọt'], ['car', '🚗', 'ô tô'], ['cat', '🐱', 'con mèo'], ['cup', '☕', 'cái cốc']],
    s: [['I have a cake.', 'Mình có một cái bánh.', 'cake'], ['I have a car.', 'Mình có một chiếc ô tô.', 'car'], ['I have a cat.', 'Mình có một con mèo.', 'cat'], ['I have a cup.', 'Mình có một cái cốc.', 'cup']] },
  { n: 3, L: 'A', place: 'Ở chợ phố', en: 'At the street market',
    w: [['apple', '🍎', 'quả táo'], ['bag', '🎒', 'cái túi'], ['can', '🥫', 'cái lon'], ['hat', '👒', 'cái mũ']],
    s: [['This is my apple.', 'Đây là quả táo của mình.', 'apple'], ['This is my bag.', 'Đây là cái túi của mình.', 'bag'], ['This is my can.', 'Đây là cái lon của mình.', 'can'], ['This is my hat.', 'Đây là cái mũ của mình.', 'hat']] },
  { n: 4, L: 'D', place: 'Trong phòng ngủ', en: 'In the bedroom',
    w: [['desk', '🪑', 'bàn học'], ['dog', '🐶', 'con chó'], ['door', '🚪', 'cửa ra vào'], ['duck', '🦆', 'con vịt']],
    s: [['This is a desk.', 'Đây là cái bàn học.', 'desk'], ['This is a dog.', 'Đây là con chó.', 'dog'], ['This is a door.', 'Đây là cái cửa.', 'door'], ['This is a duck.', 'Đây là con vịt.', 'duck']] },
  { n: 5, L: 'I', place: 'Ở tiệm cá và khoai chiên', en: 'At the fish and chip shop',
    w: [['chicken', '🍗', 'thịt gà'], ['chips', '🍟', 'khoai tây chiên'], ['fish', '🐟', 'con cá'], ['milk', '🥛', 'sữa']],
    s: [['I like chicken.', 'Mình thích thịt gà.', 'chicken'], ['I like chips.', 'Mình thích khoai tây chiên.', 'chips'], ['I like fish.', 'Mình thích cá.', 'fish'], ['I like milk.', 'Mình thích sữa.', 'milk']] },
  { n: 6, L: 'E', place: 'Trong lớp học', en: 'In the classroom',
    w: [['bell', '🔔', 'cái chuông'], ['pen', '🖊️', 'bút mực'], ['pencil', '✏️', 'bút chì'], ['red', '🔴', 'màu đỏ']],
    s: [["It's a red bell.", 'Đó là cái chuông màu đỏ.', 'bell'], ["It's a red pen.", 'Đó là cây bút mực màu đỏ.', 'pen'], ["It's a red pencil.", 'Đó là cây bút chì màu đỏ.', 'pencil']] },
  { n: 7, L: 'G', place: 'Trong vườn', en: 'In the garden',
    w: [['garden', '🏡', 'khu vườn'], ['girl', '👧', 'bạn gái'], ['goat', '🐐', 'con dê'], ['gate', '🚧', 'cái cổng']],
    s: [["There's a garden.", 'Có một khu vườn.', 'garden'], ["There's a girl.", 'Có một bạn gái.', 'girl'], ["There's a goat.", 'Có một con dê.', 'goat'], ["There's a gate.", 'Có một cái cổng.', 'gate']] },
  { n: 8, L: 'H', place: 'Trong công viên', en: 'In the park',
    w: [['hair', '💇', 'mái tóc'], ['hand', '✋', 'bàn tay'], ['head', '🙆', 'cái đầu'], ['horse', '🐴', 'con ngựa']],
    s: [['Touch your hair.', 'Chạm vào tóc của bé.', 'hair'], ['Touch your hand.', 'Chạm vào bàn tay của bé.', 'hand'], ['Touch your head.', 'Chạm vào đầu của bé.', 'head']] },
  { n: 9, L: 'O', place: 'Trong cửa hàng', en: 'In the shop', count: true,
    w: [['clocks', '🕐', 'đồng hồ'], ['locks', '🔒', 'ổ khóa'], ['mops', '🧹', 'cây lau nhà'], ['pots', '🍲', 'cái nồi']],
    s: [] },
  { n: 10, L: 'M', place: 'Ở sở thú', en: 'At the zoo',
    w: [['mango', '🥭', 'quả xoài'], ['monkey', '🐵', 'con khỉ'], ['mother', '👩', 'mẹ'], ['mouse', '🐭', 'con chuột']],
    s: [["That's a mango.", 'Kia là quả xoài.', 'mango'], ["That's a monkey.", 'Kia là con khỉ.', 'monkey'], ["That's my mother.", 'Kia là mẹ của mình.', 'mother'], ["That's a mouse.", 'Kia là con chuột.', 'mouse']] },
  { n: 11, L: 'U', place: 'Ở bến xe buýt', en: 'At the bus stop',
    w: [['bus', '🚌', 'xe buýt'], ['running', '🏃', 'đang chạy'], ['sun', '☀️', 'mặt trời'], ['truck', '🚚', 'xe tải']],
    s: [["It's a bus.", 'Đó là xe buýt.', 'bus'], ["She's running.", 'Bạn ấy đang chạy.', 'running'], ["It's the sun.", 'Đó là mặt trời.', 'sun'], ["It's a truck.", 'Đó là xe tải.', 'truck']] },
  { n: 12, L: 'L', place: 'Ở bên hồ', en: 'At the lake',
    w: [['lake', '🏞️', 'hồ nước'], ['leaf', '🍃', 'chiếc lá'], ['lemons', '🍋', 'quả chanh'], ['Lucy', '👧', 'bạn Lucy']],
    s: [['Look at the lake.', 'Nhìn cái hồ kìa.', 'lake'], ['Look at the leaf.', 'Nhìn chiếc lá kìa.', 'leaf'], ['Look at the lemons.', 'Nhìn những quả chanh kìa.', 'lemon'], ['Look at Lucy.', 'Nhìn bạn Lucy kìa.', 'lucy']] },
  { n: 13, L: 'N', place: 'Ở căng tin trường', en: 'In the school canteen',
    w: [['bananas', '🍌', 'quả chuối'], ['noodles', '🍜', 'mì sợi'], ['nuts', '🥜', 'các loại hạt'], ['Nick', '👦', 'bạn Nick']],
    s: [["He's having bananas.", 'Bạn ấy đang ăn chuối.', 'banana'], ["She's having noodles.", 'Bạn ấy đang ăn mì.', 'noodle'], ["He's having nuts.", 'Bạn ấy đang ăn hạt.', 'nut']] },
  { n: 14, L: 'T', place: 'Ở cửa hàng đồ chơi', en: 'In the toy shop',
    w: [['teddy bear', '🧸', 'gấu bông'], ['tiger', '🐯', 'con hổ'], ['top', '🌀', 'con quay'], ['turtle', '🐢', 'con rùa']],
    s: [['I can see a teddy bear.', 'Mình nhìn thấy gấu bông.', 'teddy'], ['I can see a tiger.', 'Mình nhìn thấy con hổ.', 'tiger'], ['I can see a top.', 'Mình nhìn thấy con quay.', 'top'], ['I can see a turtle.', 'Mình nhìn thấy con rùa.', 'turtle']] },
  { n: 15, L: 'F', place: 'Ở trận bóng đá', en: 'At the football match',
    w: [['face', '🙂', 'khuôn mặt'], ['father', '👨', 'bố'], ['foot', '🦶', 'bàn chân'], ['football', '⚽', 'quả bóng đá']],
    s: [["That's my father.", 'Kia là bố của mình.', 'father'], ['Point to your face.', 'Chỉ vào mặt của bé.', 'face'], ['Point to your foot.', 'Chỉ vào chân của bé.', 'foot'], ["That's my football.", 'Kia là quả bóng của mình.', 'football']] },
  { n: 16, L: 'W', place: 'Ở nhà', en: 'At home',
    w: [['washing', '🧺', 'giặt quần áo'], ['water', '💧', 'nước'], ['Wendy', '👧', 'bạn Wendy'], ['window', '🪟', 'cửa sổ']],
    s: [['I can see Wendy.', 'Mình nhìn thấy bạn Wendy.', 'wendy'], ['I can see water.', 'Mình nhìn thấy nước.', 'water'], ['I can see a window.', 'Mình nhìn thấy cửa sổ.', 'window'], ["She's washing.", 'Bạn ấy đang giặt đồ.', 'washing']] }
];

/* Sinh lượt chơi cho từng phần của Unit (dùng chung bộ máy "Nói chuyện") */
function bookTurns(u, part) {
  const ch = (w) => ({ t: w[0], e: w[1] });
  if (part === 'words') {
    const learn = u.w.map(w => ({
      say: `${u.L}. ${w[0]}. Say: ${w[0]}!`, vi: `Chữ ${u.L}: ${w[0]} là ${w[2]}. Bé nói theo nhé!`,
      pic: w[1], word: w[0], accept: [w[0].toLowerCase(), w[0].toLowerCase().replace(/s$/, '')],
      choices: [ch(w)], model: `Say: ${w[0]}!`, good: `${w[0]}! ${pick(PRAISE)}`
    }));
    const find = shuffle(u.w).map(w => ({
      say: `Find: ${w[0]}!`, vi: `Bé tìm hình ${w[2]} nhé!`, pic: '👂',
      accept: [w[0].toLowerCase()], choices: shuffle([w, ...shuffle(u.w.filter(x => x !== w)).slice(0, 2)]).map(ch),
      model: `This is ${w[0]}. ${w[1]}`, good: `Yes! ${w[0]}!`, tapOnly: true
    }));
    return [...learn, ...find];
  }
  if (u.count) { // Unit 9: How many ...?
    return shuffle(u.w).map(w => {
      const k = 2 + Math.floor(Math.random() * 4);
      const others = shuffle([k - 1, k + 1, k + 2].filter(x => x >= 1)).slice(0, 2);
      return {
        say: `How many ${w[0]}?`, vi: `Có mấy ${w[2]}? Bé đếm rồi nói nhé!`, pic: w[1].repeat(k), small: true,
        accept: [NUMBER_WORDS[k], String(k)], choices: shuffle([k, ...others]).map(x => ({ t: NUMBER_WORDS[x], e: String(x) })),
        model: `${NUMBER_WORDS[k]} ${w[0]}. Say: ${NUMBER_WORDS[k]}!`, grade: true, good: `Yes! ${NUMBER_WORDS[k]} ${w[0]}!`
      };
    });
  }
  return u.s.map(s => {
    const w = u.w.find(x => x[0].toLowerCase().startsWith(s[2])) || u.w[0];
    return {
      say: `Listen: ${s[0]} Now you!`, vi: `${s[1]} Bé nói theo nhé!`, pic: w[1],
      accept: [s[2]], choices: [{ t: s[0], e: '🗣️' }], model: `Say: ${s[0]}`, good: `${s[0]} ${pick(PRAISE)}`
    };
  });
}
