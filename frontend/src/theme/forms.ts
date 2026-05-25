import { colors } from "@/src/theme/colors";
import { radius } from "@/src/theme/radius";
import { spacing } from "@/src/theme/spacing";
import { typography } from "@/src/theme/typography";

export const formTokens = {
  inputMinHeight: 48,
} as const;

export const formStyles = {
  sectionTitle: {
    ...typography.cardTitle,
    color: colors.neutralText,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  label: {
    ...typography.caption,
    color: colors.neutralText,
    marginBottom: 6,
    marginTop: spacing.md,
  },
  input: {
    minHeight: formTokens.inputMinHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  inputError: {
    borderWidth: 2,
    borderColor: colors.danger,
  },
  readonlyInput: {
    minHeight: formTokens.inputMinHeight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    backgroundColor: colors.surfaceMuted,
    justifyContent: "center" as const,
  },
  readonlyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  placeholder: {
    color: colors.textSubtle,
  },
  helperText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.neutralSoft,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  chipActive: {
    backgroundColor: colors.surfaceTint,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  chipTextActive: {
    color: colors.primary,
  },
} as const;
