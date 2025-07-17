/**
 * @param  {String}  url
 * @param  {Boolean} isNoCaseSensitive 是否区分大小写
 * @return {Object}
 */
// import numeral from 'numeral';

import { Base64 } from 'js-base64';
import JSEncrypt from 'jsencrypt';

export const getWidth = () => {
  return { width: window.innerWidth };
};
export const rsaPsw = (password: string) => {
  const pub =
    '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr1KlvagFKU0wgjhJkXnFa6n9GlxKoOW55rLaITYof+I2rjNBA7ddW22v804MqJSPyC4d4gKbApul5BYXnAhK8Z6qf9sUMRsks+dc+sxVU/sBUJt1w31HM+KRw4gAias/qRpE9i+VCG7zijZQVpLrOlZ4a/ia8CZ6dHsknpMq/TU2pPJcp2yJsGb7hroogn1V4lz+H0mRw9idGM0ebs2WagtNbrO28UZ6tugMK5MQPb1puKlOGVS7EviR+82Cl56jV0NmYDYO7YJlne+X46uBc5hfhByznXSrmwhZHsgB9wYsWYQf1pO58JtE+gb1GEjoYWN2psJhlGh+23v+DnlPrQIDAQAB-----END PUBLIC KEY-----';
  const encryptor = new JSEncrypt();

  encryptor.setPublicKey(pub);

  return encryptor.encrypt(Base64.encode(password));
};

export default {
  getWidth,
  rsaPsw,
};

export const getFileExtension = (filename: string) =>
  filename.slice(filename.lastIndexOf('.') + 1).toLowerCase();
