const express = require('express');
const router = express.Router();
const ctrl = require('./controllers');
const pool = require('./db');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/tournaments', ctrl.getTournaments);
router.post('/join', ctrl.joinTournament);
router.post('/current', ctrl.getCurrentTournament);
router.post('/topup', ctrl.topUp);
router.post('/admin/block', ctrl.blockUser);
router.post('/admin/create', ctrl.createTournament);
router.post('/admin/send_lobby', ctrl.sendLobby);
router.post('/admin/archiveParticipants', async (req, res) => {
  try {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Копируем участников в архив
      await client.query(`
        INSERT INTO participants_archive (nickname, pubg_id, tournament_id, joined_at)
        SELECT nickname, pubg_id, tournament_id, joined_at FROM participants
      `);

      // Удаляем участников из текущей таблицы
      await client.query(`DELETE FROM participants`);

      await client.query('COMMIT');
      res.json({ message: 'Архивация прошла успешно' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error(e);
      res.status(500).json({ error: 'Ошибка архивации' });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка подключения к базе' });
  }
});
router.get('/user', async (req, res) => {
  const pubg_id = req.query.pubg_id;
  if (!pubg_id) {
    return res.status(400).json({ error: 'pubg_id обязателен' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE pubg_id = $1', [pubg_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка при запросе пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.delete('/admin/delete/:id', async (req, res) => {
  const tournamentId = parseInt(req.params.id, 10);
  if (isNaN(tournamentId)) {
    return res.status(400).json({ error: 'Неверный ID турнира' });
  }

  try {
    const result = await pool.query('DELETE FROM tournaments WHERE id = $1', [tournamentId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Турнир не найден' });
    }

    res.json({ message: 'Турнир успешно удалён' });
  } catch (err) {
    console.error('Ошибка при удалении турнира:', err);
    res.status(500).json({ error: 'Ошибка сервера при удалении турнира' });
  }
});



module.exports = router;
