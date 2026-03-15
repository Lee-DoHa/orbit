import { Platform, Alert } from 'react-native';

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
    Alert.alert('내보내기 완료', 'CSV 파일이 다운로드되었습니다.');
  } else {
    // Native: would use expo-sharing in production
    Alert.alert('내보내기', 'CSV 내보내기는 웹 버전에서 사용할 수 있습니다.');
  }
}
