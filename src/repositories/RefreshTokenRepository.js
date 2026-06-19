import BD from '../db/BD.js';

class RefreshTokenRepository {
  create({ idUsuario, tokenHash, familyId, expiresAt }) {
    return BD.queryOne(
      `
        INSERT INTO refresh_tokens (id_usuario, token_hash, family_id, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `,
      [idUsuario, tokenHash, familyId, expiresAt],
    );
  }

  findByTokenHash(tokenHash) {
    return BD.queryOne('SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1', [tokenHash]);
  }

  revoke(tokenHash, replacedByTokenHash = null) {
    return BD.execute(
      `
        UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP),
            replaced_by_token_hash = COALESCE(replaced_by_token_hash, $2)
        WHERE token_hash = $1
      `,
      [tokenHash, replacedByTokenHash],
    );
  }

  revokeFamily(familyId) {
    return BD.execute(
      `
        UPDATE refresh_tokens
        SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP)
        WHERE family_id = $1
      `,
      [familyId],
    );
  }
}

export default new RefreshTokenRepository();
