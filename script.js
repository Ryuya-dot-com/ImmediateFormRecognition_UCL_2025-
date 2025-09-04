// 単語リスト（指定のリストに更新）
const words = [
    'basalt',
    'combustion',
    'conflagration',
    'deluge',
    'drought',
    'embankment',
    'epicenter',
    'famine',
    'levee',
    'outage',
    'reservoir',
    'rubble',
    'subduction',
    'subsidence',
    'torrent',
    'tremor',
    'vent',
    'vortex',
    'triage',
    'reclamation',
    'vestige',
    'hydrology',
    'pestilence',
    'havoc',
    'ballast',
    'garment',
    'innflux',
    'blizzard'
];

// グローバル変数
let currentWordIndex = 0;
let testResults = [];
let currentAnswer = null;
let testStartTime = null;
let participantInfo = {};
let shuffledWords = [];

// 配列をフィッシャー–イェーツでシャッフル
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// キーボード入力は使用しない（マウス操作のみ）

// テスト開始（参加者情報入力後）
function startTest() {
    const id = document.getElementById('participantId').value.trim();
    const name = document.getElementById('participantName').value.trim();
    
    if (!id || !name) {
        alert('参加者IDと名前を入力してください。');
        return;
    }
    
    participantInfo = { 
        id: id, 
        name: name 
    };
    showScreen('instructionScreen');
}

// テスト実行開始
function beginTest() {
    showScreen('testScreen');
    testStartTime = Date.now();
    // 単語順序を完全ランダム化
    shuffledWords = words.slice();
    shuffleArray(shuffledWords);
    currentWordIndex = 0;
    testResults = [];
    showNextWord();
}

// 画面切り替え
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// 次の単語を表示
function showNextWord() {
    if (currentWordIndex >= shuffledWords.length) {
        endTest();
        return;
    }
    
    // リセット
    currentAnswer = null;
    document.getElementById('yesButton').classList.remove('selected');
    document.getElementById('noButton').classList.remove('selected');
    document.getElementById('confidenceSection').classList.remove('show');
    document.querySelectorAll('.confidence-button').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // 新しい単語を表示
    document.getElementById('currentWord').textContent = shuffledWords[currentWordIndex];
    updateProgress();
}

// プログレスバーを更新
function updateProgress() {
    const progress = ((currentWordIndex / shuffledWords.length) * 100).toFixed(0);
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressFill').textContent = ''; // 数字を表示しない
}

// Yes/Noの回答を選択
function selectAnswer(answer) {
    if (currentAnswer) return;
    
    currentAnswer = answer;
    
    // ビジュアルフィードバック
    document.getElementById('yesButton').classList.remove('selected');
    document.getElementById('noButton').classList.remove('selected');
    
    if (answer === 'yes') {
        document.getElementById('yesButton').classList.add('selected');
    } else {
        document.getElementById('noButton').classList.add('selected');
    }
    
    // 自信度セクションを表示
    document.getElementById('confidenceSection').classList.add('show');
}

// 自信度を選択
function selectConfidence(level, label, btnEl) {
    if (!currentAnswer) return;
    
    // 結果を保存
    testResults.push({
        wordIndex: currentWordIndex + 1,
        word: shuffledWords[currentWordIndex],
        answer: currentAnswer,
        confidence: level,
        confidenceLabel: label
    });
    
    // ビジュアルフィードバック
    if (btnEl) btnEl.classList.add('selected');
    
    // 次の単語へ（短い遅延後）
    setTimeout(() => {
        currentWordIndex++;
        showNextWord();
    }, 200);
}

// テスト終了
function endTest() {
    const totalTimeMs = Date.now() - testStartTime;
    
    // テスト情報を保存
    participantInfo.totalTimeMs = totalTimeMs;
    participantInfo.testDate = new Date().toISOString();
    
    showScreen('resultScreen');
}

// 結果をCSV形式でエクスポート
function exportResults() {
    // CSVヘッダー（小文字スネークケース）
    let csv = 'participant_id,participant_name,test_date,total_time_ms,word_number,word,answer,confidence_level,confidence_label\n';
    
    // データ行を追加
    testResults.forEach((result) => {
        csv += `${participantInfo.id},${participantInfo.name},${participantInfo.testDate},${participantInfo.totalTimeMs},${result.wordIndex},${result.word},${result.answer},${result.confidence},${result.confidenceLabel}\n`;
    });
    
    // BOMを追加してExcelでの文字化けを防ぐ
    const bom = '\uFEFF';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    
    // ダウンロードリンクを作成
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // ファイル名を form_recognition_参加者番号_日付と時間.csv の形式で生成
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const filename = `form_recognition_${participantInfo.id}_${year}${month}${day}_${hours}${minutes}${seconds}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    // ダウンロードを実行
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // URLを解放
    URL.revokeObjectURL(url);
}
