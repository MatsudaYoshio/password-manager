import { uuidv7 } from 'uuidv7';

class Credential {
  public readonly id: string = uuidv7();
  public name: string = '';
  public value: string = '';
  public showValue: boolean = false;
  public description?: string;

  constructor(params: Partial<Credential>) {
    Object.assign(this, params);
  }
}

export const createDefaultCredential = (index: number): Credential => {
  const name = index === 0 ? 'アカウントID' : index === 1 ? 'パスワード' : '';
  return new Credential(name ? { name } : {});
};

// Credentialクラスのプレーンオブジェクト型
export type CredentialPlain = {
  [K in keyof Credential]: Credential[K];
};

export default Credential;
