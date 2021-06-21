import { formatDistanceToNowStrict } from 'date-fns'
import ja from 'date-fns/locale/ja'
import { useEffect, useState } from 'react';

const calcRemainCount = (finishAt: Date) => {
  const current = new Date();
  const countSecond = (finishAt.getTime() - current.getTime());
  return countSecond; // Math.max(countSecond, 0);
};

const CountDownTimer = ({ finishAt }: { finishAt: Date }) => {
  const [count, setCount] = useState(calcRemainCount(finishAt)); // 残り時間(ミリ秒)

  useEffect(() => {
    const timer = setInterval(function () {
      setCount(calcRemainCount(finishAt));
    }, 200);

    return function cleanup() {
      clearInterval(timer);
    };
  });

  const result = formatDistanceToNowStrict(
    finishAt, { addSuffix: true, locale: ja }
  )

  return <>{result}</>;
}

export default CountDownTimer;