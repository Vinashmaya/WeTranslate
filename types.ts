export interface TranslationResult {
  originalLanguage: string;
  englishTranslation: string;
}

export interface GeneratedResponse {
  englishReply: string;
  targetLanguageReply: string;
}

export interface ChromeMessage {
  type: 'SELECTED_TEXT';
  text: string;
}