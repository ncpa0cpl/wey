export class Service {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  login(callback: () => void) {
    throw new Error("This method should be implemented by clients");
  }

  createAccount(id: string, name: string, token: string) {
    throw new Error("This method should be implemented by clients");
  }
}
