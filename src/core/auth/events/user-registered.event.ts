import { EventInterface } from 'src/core/@shared/events/event.interface';

interface UserRegisteredEventData {
  to: string;
  subject: string;
  username: string;
}

export class UserRegisteredEvent implements EventInterface {
  dateTimeOccurred: Date;
  eventData: UserRegisteredEventData;

  constructor(eventData: UserRegisteredEventData) {
    this.dateTimeOccurred = new Date();
    this.eventData = eventData;
  }
}
