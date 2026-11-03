/* Nội dung bài học — sửa/thêm tại đây */

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'];

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '0123456789'.split('');

const LETTER_WORDS = {
  A: ['apple', '🍎'], B: ['ball', '⚽'], C: ['cat', '🐱'], D: ['dog', '🐶'], E: ['egg', '🥚'],
  F: ['fish', '🐟'], G: ['grapes', '🍇'], H: ['hat', '👒'], I: ['ice cream', '🍦'], J: ['juice', '🧃'],
  K: ['kite', '🪁'], L: ['lion', '🦁'], M: ['moon', '🌙'], N: ['nose', '👃'], O: ['orange', '🍊'],
  P: ['pig', '🐷'], Q: ['queen', '👸'], R: ['rabbit', '🐰'], S: ['sun', '☀️'], T: ['tree', '🌳'],
  U: ['umbrella', '☂️'], V: ['van', '🚐'], W: ['whale', '🐳'], X: ['box', '📦'], Y: ['yo-yo', '🪀'], Z: ['zebra', '🦓']
};

/* emoji, số ít, số nhiều */
const COUNT_ITEMS = [
  ['🍎', 'apple', 'apples'], ['⭐', 'star', 'stars'], ['🐟', 'fish', 'fish'], ['🎈', 'balloon', 'balloons'],
  ['🐤', 'chick', 'chicks'], ['🌸', 'flower', 'flowers'], ['🚗', 'car', 'cars'], ['🍌', 'banana', 'bananas'],
  ['🦋', 'butterfly', 'butterflies'], ['🧁', 'cupcake', 'cupcakes'], ['🐞', 'ladybug', 'ladybugs'], ['🍓', 'strawberry', 'strawberries']
];

const PRAISE = ['Great job!', 'Wonderful!', 'You did it!', 'Super!', 'Well done!', 'Amazing!', 'Yay!', 'Good job!'];
const PRAISE_VI = ['Giỏi quá!', 'Tuyệt vời!', 'Bé làm được rồi!', 'Siêu quá!', 'Hay lắm!'];

/* ---------- HỘI THOẠI THEO KỊCH BẢN ----------
   Mỗi lượt (turn):
   say    : câu nhân vật nói (tiếng Anh). {char} {name} {age} sẽ được thay.
   vi     : gợi ý tiếng Việt cho bé
   pic    : emoji minh họa  |  color: mã màu (bài màu sắc)
   accept : các từ khóa chấp nhận khi bé nói
   choices: nút bấm trả lời (cho bé chưa nói được)
   model  : câu mẫu khi bé trả lời chưa đúng
   good   : câu khen khi đúng
   type   : 'name' | 'age' | 'action' (làm động tác) | mặc định 'ask'
*/
function itemTurns(list, question, questionVi) {
  return list.map((it, i) => {
    const others = list.filter(x => x !== it).sort(() => Math.random() - 0.5).slice(0, 2).map(x => x.w);
    return {
      say: question, vi: questionVi, pic: it.pic, color: it.color,
      accept: [it.w, ...(it.alt || [])],
      choices: [it.w, ...others].sort(() => Math.random() - 0.5),
      model: `It is ${it.a || ''}${it.w}. Say: ${it.w}!`.replace('It is  ', 'It is '),
      good: it.good, viAnswer: it.vi
    };
  });
}

const TOPICS = [
  {
    id: 'hello', icon: '👋', vi: 'Chào hỏi', en: 'Hello!',
    turns: () => [
      { say: 'Hello! I am {char}. Say hello!', vi: 'Bé chào bạn nhé. Nói: Hello!', pic: '👋',
        accept: ['hello', 'hi', 'hey', 'hallo', 'hullo', 'helo'], choices: ['Hello!'], good: 'Hello, hello! Yay!' },
      { type: 'name', say: "What's your name?", vi: 'Bé tên là gì? Nói: My name is ...', pic: '😊',
        good: 'Nice to meet you, {name}!' },
      { say: 'How are you?', vi: 'Bé có khỏe không? Nói: I am fine!', pic: '🙂',
        accept: ['fine', 'good', 'great', 'happy', 'ok', 'okay', 'well', 'super'], choices: ['I am fine!', 'I am happy!'],
        model: 'Say: I am fine!', good: 'Yay! I am happy too!' },
      { type: 'age', say: 'How old are you?', vi: 'Bé mấy tuổi? Nói: I am four!', pic: '🎂',
        choices: ['I am three', 'I am four', 'I am five'], good: 'Wow, {age}! You are so big!' },
      { say: 'Can you wave your hand? Wave, wave!', vi: 'Bé vẫy tay nào!', pic: '🖐️', type: 'action', good: 'Wave wave! Hello!' },
      { say: "It's time to go. Bye bye!", vi: 'Tạm biệt nhé! Nói: Bye bye!', pic: '👋',
        accept: ['bye', 'goodbye', 'see you'], choices: ['Bye bye!'], model: 'Say: bye bye!', good: 'Bye bye! See you soon!' }
    ]
  },
  {
    id: 'colors', icon: '🎨', vi: 'Màu sắc', en: 'Colors',
    turns: () => itemTurns([
      { w: 'red', color: '#e53935', good: 'Red! Red like an apple!', vi: 'màu đỏ' },
      { w: 'blue', color: '#1e88e5', good: 'Blue! Blue like the sky!', vi: 'màu xanh dương' },
      { w: 'yellow', color: '#fdd835', good: 'Yellow! Yellow like the sun!', vi: 'màu vàng' },
      { w: 'green', color: '#43a047', good: 'Green! Green like a leaf!', vi: 'màu xanh lá' },
      { w: 'orange', color: '#fb8c00', good: 'Orange! Like an orange!', vi: 'màu cam' },
      { w: 'pink', color: '#f06292', good: 'Pink! So pretty!', vi: 'màu hồng' },
      { w: 'purple', color: '#8e24aa', good: 'Purple! I love purple!', vi: 'màu tím' }
    ].sort(() => Math.random() - 0.5).slice(0, 5), 'What color is this?', 'Đây là màu gì?')
  },
  {
    id: 'animals', icon: '🐾', vi: 'Con vật', en: 'Animals',
    turns: () => itemTurns([
      { w: 'cat', a: 'a ', pic: '🐱', alt: ['kitty', 'kitten'], good: 'Yes! A cat! Meow, meow!', vi: 'con mèo' },
      { w: 'dog', a: 'a ', pic: '🐶', alt: ['puppy', 'doggy'], good: 'A dog! Woof, woof!', vi: 'con chó' },
      { w: 'cow', a: 'a ', pic: '🐮', good: 'A cow! Moo, moo!', vi: 'con bò' },
      { w: 'duck', a: 'a ', pic: '🦆', good: 'A duck! Quack, quack!', vi: 'con vịt' },
      { w: 'pig', a: 'a ', pic: '🐷', alt: ['piggy'], good: 'A pig! Oink, oink!', vi: 'con heo' },
      { w: 'lion', a: 'a ', pic: '🦁', good: 'A lion! Roar!', vi: 'con sư tử' },
      { w: 'fish', a: 'a ', pic: '🐟', good: 'A fish! Splash, splash!', vi: 'con cá' },
      { w: 'bird', a: 'a ', pic: '🐦', alt: ['birdie'], good: 'A bird! Tweet, tweet!', vi: 'con chim' },
      { w: 'elephant', a: 'an ', pic: '🐘', good: 'An elephant! So big!', vi: 'con voi' },
      { w: 'monkey', a: 'a ', pic: '🐵', good: 'A monkey! Ooh ooh, ah ah!', vi: 'con khỉ' }
    ].sort(() => Math.random() - 0.5).slice(0, 5), "What's this?", 'Đây là con gì?')
  },
  {
    id: 'fruits', icon: '🍓', vi: 'Trái cây', en: 'Fruits',
    turns: () => itemTurns([
      { w: 'apple', a: 'an ', pic: '🍎', good: 'An apple! Crunch, crunch!', vi: 'quả táo' },
      { w: 'banana', a: 'a ', pic: '🍌', good: 'A banana! Yummy!', vi: 'quả chuối' },
      { w: 'orange', a: 'an ', pic: '🍊', good: 'An orange! So juicy!', vi: 'quả cam' },
      { w: 'grapes', a: '', pic: '🍇', alt: ['grape'], good: 'Grapes! I love grapes!', vi: 'chùm nho' },
      { w: 'watermelon', a: 'a ', pic: '🍉', alt: ['water melon'], good: 'Watermelon! So sweet!', vi: 'dưa hấu' },
      { w: 'strawberry', a: 'a ', pic: '🍓', good: 'A strawberry! Yum yum!', vi: 'quả dâu' },
      { w: 'mango', a: 'a ', pic: '🥭', good: 'A mango! Delicious!', vi: 'quả xoài' }
    ].sort(() => Math.random() - 0.5).slice(0, 5), "What's this?", 'Đây là quả gì?')
  },
  {
    id: 'feelings', icon: '😊', vi: 'Cảm xúc', en: 'Feelings',
    turns: () => itemTurns([
      { w: 'happy', pic: '😄', good: 'Happy! Big smile!', vi: 'vui' },
      { w: 'sad', pic: '😢', good: 'Sad. Let me give you a hug!', vi: 'buồn' },
      { w: 'angry', pic: '😠', alt: ['mad'], good: 'Angry! Take a deep breath!', vi: 'tức giận' },
      { w: 'sleepy', pic: '😴', alt: ['tired'], good: 'Sleepy! Yawn!', vi: 'buồn ngủ' },
      { w: 'surprised', pic: '😲', alt: ['wow'], good: 'Surprised! Wow!', vi: 'ngạc nhiên' }
    ].sort(() => Math.random() - 0.5), 'How does he feel?', 'Bạn ấy cảm thấy thế nào?')
  },
  {
    id: 'body', icon: '🙆', vi: 'Cơ thể', en: 'My body',
    turns: () => [
      { type: 'action', say: 'Touch your nose!', vi: 'Bé chạm vào mũi nào!', pic: '👃', good: 'Nose! Beep beep!' },
      { type: 'action', say: 'Touch your eyes!', vi: 'Bé chạm vào mắt nào!', pic: '👀', good: 'Eyes! I can see you!' },
      { type: 'action', say: 'Touch your ears!', vi: 'Bé chạm vào tai nào!', pic: '👂', good: 'Ears! Listen, listen!' },
      { type: 'action', say: 'Clap your hands!', vi: 'Bé vỗ tay nào!', pic: '👏', good: 'Clap, clap, clap! Yay!' },
      { type: 'action', say: 'Jump, jump, jump!', vi: 'Bé nhảy lên nào!', pic: '🦘', good: 'Jumping! You are a kangaroo!' },
      { type: 'action', say: 'Touch your head!', vi: 'Bé chạm vào đầu nào!', pic: '🙆', good: 'Head! Great job!' }
    ].sort(() => Math.random() - 0.5)
  }
];
