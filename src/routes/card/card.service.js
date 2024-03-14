const getColorCode = () => {
  return Math.floor(Math.random() * 7);
};
const getDateTimeFormat = (timeObject) => {
  const year = +timeObject['year'];
  const month = +timeObject['month'];
  const day = +timeObject['day'];
  const hour = +timeObject['hour'];
  const minute = +timeObject['minute'];
  const date = new Date(year, month - 1, day, hour, minute);
  const dateTimeFormat = date.toISOString().slice(0, 19).replace('T', ' ');
  return dateTimeFormat;
};

export class CardsService {
  constructor(CardsRepository) {
    this.CardsRepository = CardsRepository;
  }
  findAllCardWithColumnId = async (columnId) => {
    const Cards = await this.CardsRepository.findAllCardsWithColumnId(columnId);
    return Cards;
  };
  createCard = async (columnId, cardWriterId, cardData) => {
    //카드의 색상을 랜덤으로 지정
    cardData.colorCord = getColorCode();
    //시작시간의 시간 형식을 변경
    cardData.cardStartTime = getDateTimeFormat(cardData.cardStartTime);
    //종료시간의 시간 형식을 변경
    cardData.cardEndTime = getDateTimeFormat(cardData.cardEndTime);
    if (cardData.cardStartTime > cardData.cardEndTime) {
      const error = new Error('시작 시간은 종료시간보다 빠를 수 없습니다.');
      error.status = 400;
      throw error;
    }
    const lastCardOrder = await this.CardsRepository.findLastCardOrder(
      cardData.columnId
    );
    const card = await this.CardsRepository.createCard(columnId, cardWriterId, {
      ...cardData,
      cardOrder: lastCardOrder + 1,
    });
    return card;
  };
  updateCard = async (cardId, cardWriterId, cardData) => {
    const targetCard = await this.CardsRepository.findCard(cardId);
    if (!targetCard) {
      const error = new Error('카드가 존재하지 않습니다.');
      error.status = 404;
      throw error;
    }
    const cardStartTime = targetCard.cardStartTime;
    const cardEndTime = targetCard.cardEndTime;
    //시작시간을 수정하는 경우 시간 형식을 변경
    if (cardData.cardStartTime) {
      cardStartTime = getDateTimeFormat(cardData.cardStartTime);
    }
    //종료시간을 수정하는 경우 시간 형식을 변경
    if (cardData.cardEndTime) {
      cardEndTime = getDateTimeFormat(cardData.cardEndTime);
    }
    if (cardStartTime > cardEndTime) {
      const error = new Error('시작 시간은 종료시간보다 빠를 수 없습니다.');
      error.status = 400;
      throw error;
    }
    const card = await this.CardsRepository.updateCard(
      cardId,
      cardWriterId,
      cardData
    );
    if (card) {
      const error = new Error('카드가 존재하지 않습니다.');
      error.status = 404;
      throw error;
    }
    return card;
  };
  deleteCard = async (cardId) => {
    const targetCard = await this.CardsRepository.findCard(cardId);
    if (!targetCard) {
      const error = new Error('카드가 존재하지 않습니다.');
      error.status = 404;
      throw error;
    }
    const card = await this.CardsRepository.deleteCard(cardId);
    return card;
  };
}
