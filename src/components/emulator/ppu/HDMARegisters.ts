export enum HDMARegisters {
  // Channel control registers
  DMAP0 = 0x4300, // DMA/HDMA Control for Channel 0
  DMAP1 = 0x4310, // DMA/HDMA Control for Channel 1
  DMAP2 = 0x4320, // DMA/HDMA Control for Channel 2
  DMAP3 = 0x4330, // DMA/HDMA Control for Channel 3
  DMAP4 = 0x4340, // DMA/HDMA Control for Channel 4
  DMAP5 = 0x4350, // DMA/HDMA Control for Channel 5
  DMAP6 = 0x4360, // DMA/HDMA Control for Channel 6
  DMAP7 = 0x4370, // DMA/HDMA Control for Channel 7

  // HDMA Table start address registers (low byte)
  HDMA0L = 0x4302,
  HDMA1L = 0x4312,
  HDMA2L = 0x4322,
  HDMA3L = 0x4332,
  HDMA4L = 0x4342,
  HDMA5L = 0x4352,
  HDMA6L = 0x4362,
  HDMA7L = 0x4372,

  // HDMA Table start address registers (high byte)
  HDMA0H = 0x4303,
  HDMA1H = 0x4313,
  HDMA2H = 0x4323,
  HDMA3H = 0x4333,
  HDMA4H = 0x4343,
  HDMA5H = 0x4353,
  HDMA6H = 0x4363,
  HDMA7H = 0x4373,

  // HDMA Table bank registers
  HDMA0B = 0x4304,
  HDMA1B = 0x4314,
  HDMA2B = 0x4324,
  HDMA3B = 0x4334,
  HDMA4B = 0x4344,
  HDMA5B = 0x4354,
  HDMA6B = 0x4364,
  HDMA7B = 0x4374,

  // HDMA Indirect address registers (low byte)
  HDMA0A1L = 0x4305,
  HDMA1A1L = 0x4315,
  HDMA2A1L = 0x4325,
  HDMA3A1L = 0x4335,
  HDMA4A1L = 0x4345,
  HDMA5A1L = 0x4355,
  HDMA6A1L = 0x4365,
  HDMA7A1L = 0x4375,

  // HDMA Indirect address registers (high byte)
  HDMA0A1H = 0x4306,
  HDMA1A1H = 0x4316,
  HDMA2A1H = 0x4326,
  HDMA3A1H = 0x4336,
  HDMA4A1H = 0x4346,
  HDMA5A1H = 0x4356,
  HDMA6A1H = 0x4366,
  HDMA7A1H = 0x4376,

  // HDMA Line counter registers
  HDMA0LINE = 0x4307,
  HDMA1LINE = 0x4317,
  HDMA2LINE = 0x4327,
  HDMA3LINE = 0x4337,
  HDMA4LINE = 0x4347,
  HDMA5LINE = 0x4357,
  HDMA6LINE = 0x4367,
  HDMA7LINE = 0x4377,

  // HDMA Enable register
  HDMAEN = 0x420C
}