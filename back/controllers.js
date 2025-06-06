const pool = require('./db');

exports.register = async (req, res) => {
  try {
    const { pubg_id, nickname, phone, password } = req.body;

    // Проверка заблокирован ли пользователь
    const blocked = await pool.query('SELECT 1 FROM blocked_users WHERE pubg_id = $1', [pubg_id]);
    if (blocked.rowCount) return res.status(403).json({ error: 'User is blocked' });

    // Проверяем, есть ли пользователь с таким pubg_id или телефоном
    const existingUser = await pool.query(
      'SELECT 1 FROM users WHERE pubg_id = $1 OR phone = $2',
      [pubg_id, phone]
    );
    if (existingUser.rowCount > 0) {
      return res.status(409).json({ error: 'User with this phone or pubg_id already exists' });
    }

    // Вставка нового пользователя
    await pool.query(
      'INSERT INTO users (pubg_id, nickname, phone, password, balance) VALUES ($1, $2, $3, $4, 0)',
      [pubg_id, nickname, phone, password]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { pubg_id, password } = req.body;

    // Проверка заблокирован ли пользователь
    const blocked = await pool.query('SELECT 1 FROM blocked_users WHERE pubg_id = $1', [pubg_id]);
    if (blocked.rowCount) return res.status(403).json({ error: 'User is blocked' });

    const user = await pool.query(
      'SELECT * FROM users WHERE pubg_id = $1 AND password = $2',
      [pubg_id, password]
    );
    if (!user.rowCount) return res.status(401).json({ error: 'Invalid credentials' });

    res.json({ success: true, user: user.rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getTournaments = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        t.*, 
        (SELECT COUNT(*) FROM participants p WHERE p.tournament_id = t.id) AS participants_count
      FROM tournaments t
      ORDER BY t.start_time ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Get tournaments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.joinTournament = async (req, res) => {
  try {
    const { pubg_id, tournament_id } = req.body;

    const userResult = await pool.query('SELECT * FROM users WHERE pubg_id = $1', [pubg_id]);
    if (!userResult.rowCount) return res.status(404).json({ error: 'User not found' });

    const tournamentResult = await pool.query('SELECT * FROM tournaments WHERE id = $1', [tournament_id]);
    if (!tournamentResult.rowCount) return res.status(404).json({ error: 'Tournament not found' });

    const participants = await pool.query('SELECT COUNT(*) FROM participants WHERE tournament_id = $1', [tournament_id]);
    const count = parseInt(participants.rows[0].count);

    const user = userResult.rows[0];
    const tournament = tournamentResult.rows[0];
    const userNickname =user.nickname
    if (count >= 100) return res.status(400).json({ error: 'Tournament full' });
    if (user.balance < tournament.entry_fee) return res.status(400).json({ error: 'Not enough balance' });

    await pool.query(`
  INSERT INTO participants (nickname, tournament_id, pubg_id, seat)
  SELECT $1, $2, $3, COALESCE(MAX(seat), 0) + 1
  FROM participants
  WHERE tournament_id = $2
`, [userNickname, tournament_id, pubg_id]);
   await pool.query('UPDATE users SET balance = balance - $1 WHERE pubg_id = $2', [tournament.entry_fee, pubg_id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Join tournament error:', error);
    
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getCurrentTournament = async (req, res) => {
  try {
    const { pubg_id } = req.body;
     const result = await pool.query(
      `SELECT tournaments.*, participants.seat 
FROM participants
JOIN tournaments ON tournaments.id = participants.tournament_id
WHERE participants.pubg_id = $1
ORDER BY tournaments.start_time DESC
LIMIT 1;`,
      [pubg_id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Нет текущего турнира' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при получении текущего турнира:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
};

exports.topUp = async (req, res) => {
  try {
    const { pubg_id, amount } = req.body;
    await pool.query('UPDATE users SET balance = balance + $1 WHERE pubg_id = $2', [amount, pubg_id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Top up error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};




exports.blockUser = async (req, res) => {
  const client = await pool.connect();

  try {
    const { pubg_id } = req.body;

    await client.query('BEGIN');

    // Меняем пароль
    const updateResult = await client.query(
      'UPDATE users SET password = $1 WHERE pubg_id = $2',
      ['imblockedmfker', pubg_id]
    );

    if (updateResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Добавляем в заблокированных
    await client.query('INSERT INTO blocked_users (pubg_id) VALUES ($1)', [pubg_id]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Block user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release(); // <-- client, не pool
  }
};





exports.createTournament = async (req, res) => {
  try {
    const { mode, entry_fee, prize_pool, start_time } = req.body;
    await pool.query(
      'INSERT INTO tournaments (mode, entry_fee, prize_pool, start_time) VALUES ($1, $2, $3, $4)',
      [mode, entry_fee, prize_pool, start_time]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.sendLobby = async (req, res) => {
  try {
    const { tournament_id, room_id, password } = req.body;
    await pool.query(
      'UPDATE tournaments SET room_id = $1, room_password = $2 WHERE id = $3',
      [room_id, password, tournament_id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Send lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
