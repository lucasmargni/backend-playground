from .models import Note, ChordQuality, Chord, Scale

# Builds a chord from a root note and a chord quality, returning all its notes
def build_chord(root: Note, quality: ChordQuality) -> Chord:
    notes = [root.advance(interval) for interval in quality.value]

    return Chord(root, quality, notes)

# Returns the diatonic triads of a scale - one chord per degree, built from
# the 1st, 3rd, and 5th notes of each scale position using only scale tones
def get_diatonic_chords(scale: Scale) -> list[Chord]:
    chords = []
    num_notes = len(scale.notes)

    for i in range(num_notes):
        root = scale.notes[i]
        third = scale.notes[(i+2) % num_notes]
        fifth = scale.notes[(i+4) % num_notes]

        intervals = (0, root.semitones_to(third), root.semitones_to(fifth))

        quality = next((q for q in ChordQuality if q.value == intervals), None)

        if quality is not None:
            chords.append(Chord(root, quality, [root, third, fifth]))

    return chords

# Returns all voicings of a chord by rotating its notes — includes root position
# and one inversion per additional note (first, second, and third for 7th chords)
def get_chord_inversions(chord: Chord) -> list[list[Note]]:
    notes = chord.notes

    return [notes[i:] + notes[:i] for i in range(len(notes))]