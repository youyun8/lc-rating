export type TableCol = {
  contest: {
    id: string;
    time: number;
    title: string;
    link: {
      zh: string;
      en: string;
    };
    company?: object;
  };
  problem: {
    id: string;
    title: string;
    link: {
      zh: string;
      en: string;
    };
    rating: number;
    premium: boolean;
  };
  rating: number;
  tags: {
    id: string;
    label: {
      zh: string;
      en: string;
    };
  }[];
  progress: {
    problemId: string;
  };
  solution: {
    id: string;
    title: string;
    link: {
      zh: string;
      en: string;
    };
    time: number;
  };
};

export const key2Label: { [K in keyof TableCol]: string } = {
  contest: "比賽",
  problem: "題目",
  rating: "難度",
  tags: "演算法標籤",
  progress: "進度",
  solution: "0x3F 題解",
};
