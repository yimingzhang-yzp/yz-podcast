/**
 * YZ Podcast — メール登録をスプレッドシートに転記する Google Apps Script
 * ============================================================================
 *
 * 役割:
 *   サイトのメール登録フォームから送られてきたメールアドレスを、
 *   下記スプレッドシートに1行ずつ追記する Web アプリです。
 *
 *   対象シート:
 *   https://docs.google.com/spreadsheets/d/1HrfT9etBCn2qusR7DAIat6QtlaNKoAOFEiFhfVtgrN4/edit
 *
 * --- セットアップ手順 ----------------------------------------------------------
 *   1. 上記スプレッドシートを開く。
 *   2. メニュー [拡張機能] → [Apps Script] を開く。
 *   3. コード.gs の中身をすべて削除し、このファイルの内容を貼り付けて保存。
 *   4. メニュー [デプロイ] → [新しいデプロイ] を選択。
 *        - 種類:    ウェブアプリ
 *        - 実行ユーザー: 自分
 *        - アクセス:   全員（匿名含む）
 *   5. 発行された「ウェブアプリの URL（…/exec で終わるもの）」をコピー。
 *   6. script.js の SHEET_ENDPOINT にその URL を貼り付ける。
 *
 *   ※ コードを変更したら、必ず [デプロイ] → [デプロイを管理] →
 *      鉛筆アイコン → バージョン「新バージョン」で再デプロイしてください。
 * ----------------------------------------------------------------------------
 */

// 書き込み先スプレッドシートのID（URLの /d/ と /edit の間）
var SPREADSHEET_ID = '1HrfT9etBCn2qusR7DAIat6QtlaNKoAOFEiFhfVtgrN4';

// 書き込み先タブの gid（スプレッドシートURLの #gid=0 の数値）。
// ブラウザで見ているタブと一致させてください。既定は 0（先頭タブ）。
var TARGET_GID = 0;

function doPost(e) {
  try {
    var params = (e && e.parameter) ? e.parameter : {};
    var email = (params.email || '').toString().trim();

    // 簡易バリデーション
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return json_({ ok: false, error: 'invalid_email' });
    }

    var sheet = getSheet_();

    // ヘッダー行が無ければ作成
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['日時', 'メールアドレス', '流入元', 'User-Agent']);
    }

    var now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([
      now,
      email,
      (params.source || '').toString(),
      (params.ua || '').toString()
    ]);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// 動作確認用（ブラウザでURLを開いたときに表示される）
// どのスプレッドシート・どのタブ・現在の行数に書き込むかを返す。
function doGet() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = getSheet_();
    return json_({
      ok: true,
      message: 'YZ Podcast signup endpoint is running.',
      spreadsheet: ss.getName(),
      writingToTab: sheet.getName(),
      tabGid: sheet.getSheetId(),
      currentRows: sheet.getLastRow()
    });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = ss.getSheets();
  // URLの #gid と一致するタブに書き込む（見ているタブと確実に揃える）
  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getSheetId() === TARGET_GID) return sheets[i];
  }
  // 見つからなければ先頭タブ
  return sheets[0];
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
