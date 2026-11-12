export interface AdConfiguration {
  smartlink: {
    enabled: boolean;
    url: string;
    label: string;
  };
  banner: {
    enabled: boolean;
    key: string;
    scriptUrl: string;
    width: number;
    height: number;
    placements: string[];
  };
  socialBar: {
    enabled: boolean;
    scriptUrl: string;
  };
  popunder: {
    enabled: boolean;
    scriptUrl: string;
  };
  frequency: {
    initialLevelsWithoutAds: number;
    minimumSecondsBetweenFullScreenAds: number;
    minimumCompletedLevelsBetweenFullScreenAds: number;
  };
}

export const AdConfig: AdConfiguration = {
  smartlink: {
    enabled: true,
    url: 'https://asiafilm.org/4/98fe62a7a045c7160e2e60fc420bbd60',
    label: 'Sponsored Offer'
  },

  banner: {
    enabled: true,
    key: '67112b110ba97e9e29ef42e6a75b28b5',
    scriptUrl: 'https://bicea.org/22/67112b110ba97e9e29ef42e6a75b28b5',
    width: 468,
    height: 60,
    placements: ['home', 'level-selection']
  },

  socialBar: {
    enabled: false, // Disabled by default as required by master prompt
    scriptUrl: 'https://bicea.org/14/ee5cd3e2d83573095d754104bea52587'
  },

  popunder: {
    enabled: false, // Disabled by default as required by master prompt
    scriptUrl: 'https://abscloud.org/1/07adddf57f0fef20140770c2ca7c0e73'
  },

  frequency: {
    initialLevelsWithoutAds: 6,
    minimumSecondsBetweenFullScreenAds: 180,
    minimumCompletedLevelsBetweenFullScreenAds: 3
  }
};
