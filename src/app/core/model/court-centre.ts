export interface CourtCentre {
  id: string;
  name: string;
  defaultStartTime: string;
  defaultDuration: string;
  courtRooms: CourtRoom[];
  courtCode: string;
  oucode?: string;
}

export interface CourtRoom {
  id: string;
  name: string;
}
