import 'dart:convert';
import 'dart:math';
import 'dart:typed_data';

import 'package:cryptography/cryptography.dart';

class AesGcmCrypto {
  static final _random = Random.secure();
  static final _pbkdf2 = Pbkdf2(
    macAlgorithm: Hmac.sha256(),
    iterations: 100000,
    bits: 256,
  );
  static final _aes = AesGcm.with256bits();

  static Future<String> encrypt(String plain, String password) async {
    if (password.isEmpty) throw ArgumentError('Password required');
    final salt = _bytes(16);
    final nonce = _bytes(12);
    final secretKey = await _derive(password, salt);
    final box = await _aes.encrypt(
      utf8.encode(plain),
      secretKey: secretKey,
      nonce: nonce,
    );
    final packed = Uint8List.fromList([
      ...salt,
      ...nonce,
      ...box.cipherText,
      ...box.mac.bytes,
    ]);
    return base64Encode(packed);
  }

  static Future<String> decrypt(String payload, String password) async {
    if (password.isEmpty) throw ArgumentError('Password required');
    final raw = base64.decode(payload.trim());
    if (raw.length < 28) throw FormatException('Invalid payload');
    final salt = raw.sublist(0, 16);
    final nonce = raw.sublist(16, 28);
    final macLen = 16;
    if (raw.length <= 28 + macLen) throw FormatException('Invalid payload');
    final cipherText = raw.sublist(28, raw.length - macLen);
    final mac = Mac(raw.sublist(raw.length - macLen));
    final secretKey = await _derive(password, salt);
    final clear = await _aes.decrypt(
      SecretBox(cipherText, nonce: nonce, mac: mac),
      secretKey: secretKey,
    );
    return utf8.decode(clear);
  }

  static Future<SecretKey> _derive(String password, List<int> salt) {
    return _pbkdf2.deriveKeyFromPassword(
      password: password,
      nonce: salt,
    );
  }

  static List<int> _bytes(int n) => List<int>.generate(n, (_) => _random.nextInt(256));
}
