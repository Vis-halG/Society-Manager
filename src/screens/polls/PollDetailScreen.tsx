import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { doc, getDoc } from 'firebase/firestore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ScreenContainer } from '../../components/common/ScreenContainer';
import { LoadingOverlay } from '../../components/common/LoadingOverlay';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../context/ThemeContext';
import { db } from '../../config/firebase';
import { COLLECTIONS } from '../../constants';
import { castVote, closePoll, getUserVote } from '../../services/polls.service';
import { formatDateTime, isOverdue } from '../../utils/date';
import type { Poll } from '../../types';
import type { PollsStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PollsStackParamList, 'PollDetail'>;

export function PollDetailScreen({ route }: Props) {
  const { pollId } = route.params;
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const load = async () => {
    const snap = await getDoc(doc(db, COLLECTIONS.POLLS, pollId));
    if (snap.exists()) setPoll({ id: snap.id, ...snap.data() } as Poll);
    if (user) {
      const vote = await getUserVote(pollId, user.id);
      setMyVote(vote?.optionId ?? null);
    }
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [pollId]);

  const closed = !poll?.isActive || (poll ? isOverdue(poll.deadline) : false);
  const hasVoted = !!myVote;

  const handleVote = async (optionId: string) => {
    if (!user) return;
    setVoting(optionId);
    setError(null);
    try {
      await castVote(pollId, optionId, user.id);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVoting(null);
    }
  };

  const handleClose = async () => {
    await closePoll(pollId);
    await load();
  };

  if (loading) return <LoadingOverlay />;
  if (!poll) return <Text style={styles.notFound}>Poll not found.</Text>;

  const showResults = hasVoted || closed || isAdmin;

  return (
    <ScreenContainer scroll>
      <View style={styles.headerRow}>
        <Text variant="headlineSmall" style={[styles.question, { color: colors.text }]}>
          {poll.question}
        </Text>
        <StatusBadge status={closed ? 'closed' : 'active'} />
      </View>
      <Text style={{ color: colors.textMuted, marginBottom: 24 }}>
        {poll.totalVotes} votes • Closes {formatDateTime(poll.deadline)}
      </Text>

      {error ? <Text style={{ color: colors.danger, marginBottom: 12 }}>{error}</Text> : null}

      {poll.options.map((option) => {
        const percent = poll.totalVotes > 0 ? Math.round((option.voteCount / poll.totalVotes) * 100) : 0;
        const isMine = myVote === option.id;
        return (
          <View key={option.id} style={styles.optionWrap}>
            {showResults ? (
              <View style={[styles.resultBar, { borderColor: isMine ? colors.primary : colors.border }]}>
                <View
                  style={[
                    styles.resultFill,
                    { width: `${percent}%`, backgroundColor: isMine ? colors.primary : `${colors.primary}33` },
                  ]}
                />
                <View style={styles.resultLabel}>
                  <Text style={{ color: colors.text, fontWeight: isMine ? '700' : '400' }}>
                    {option.text} {isMine ? '✓' : ''}
                  </Text>
                  <Text style={{ color: colors.textMuted }}>
                    {percent}% ({option.voteCount})
                  </Text>
                </View>
              </View>
            ) : (
              <Button
                mode="outlined"
                onPress={() => handleVote(option.id)}
                loading={voting === option.id}
                disabled={!!voting || closed}
                style={styles.voteBtn}
              >
                {option.text}
              </Button>
            )}
          </View>
        );
      })}

      {isAdmin && poll.isActive ? (
        <Button mode="outlined" textColor={colors.danger} onPress={handleClose} style={styles.closeBtn}>
          Close Poll
        </Button>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  question: { fontWeight: '700', flex: 1 },
  optionWrap: { marginBottom: 12 },
  voteBtn: { justifyContent: 'flex-start' },
  resultBar: { borderWidth: 1, borderRadius: 10, overflow: 'hidden', padding: 10, position: 'relative' },
  resultFill: { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 10 },
  resultLabel: { flexDirection: 'row', justifyContent: 'space-between' },
  closeBtn: { marginTop: 16, marginBottom: 24 },
  notFound: { textAlign: 'center', marginTop: 40 },
});
