import { Platform } from 'react-native';

export function entriesToCSV(entries: any[]): string {
  const header = '날짜,요일,감정,강도,상황,메모\n';
  const rows = entries.map((e) =>
    `${e.date},${e.dayOfWeek},"${(e.emotions || []).join(',')}",${e.intensity},"${e.context || ''}","${(e.note || '').replace(/"/g, '""')}"`
  ).join('\n');
  return header + rows;
}

export function downloadCSV(csv: string, filename: string) {
  if (Platform.OS === 'web') {
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } else {
    // Native: would use expo-sharing, but for now alert
    const { Alert } = require('react-native');
    Alert.alert('내보내기', 'CSV 파일이 준비되었습니다.');
  }
}
