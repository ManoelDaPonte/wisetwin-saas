import type { FormationMetadata } from "@/types/metadata-types";
import type {
  InteractionData,
  ResolvedInteraction,
  QuestionInteractionData,
  ProcedureInteractionData,
  TextInteractionData,
  ProcedureStepAnalyticsData,
} from "@/types/training";

/**
 * Résout une interaction en joignant les clés avec les métadonnées pour obtenir le texte localisé
 */
export function resolveInteractionText(
  interaction: InteractionData,
  metadata: FormationMetadata,
  language: string = "fr"
): ResolvedInteraction {
  const resolved: ResolvedInteraction = { ...interaction };

  try {
    const { objectId, data } = interaction;

    if (!metadata.unity || !objectId || !data) {
      return resolved;
    }

    const objectMetadata = metadata.unity[objectId];
    if (!objectMetadata) {
      console.warn(`[Resolver] Object not found in metadata: ${objectId}`);
      return resolved;
    }

    switch (interaction.type) {
      case "question": {
        const questionData = data as QuestionInteractionData;
        const questionKey = questionData.questionKey;
        if (!questionKey) {
          console.warn(`[Resolver] Missing questionKey in question interaction`);
          return resolved;
        }

        const questionMeta = objectMetadata[questionKey];
        if (questionMeta) {
          resolved.resolvedData = {
            questionText: questionMeta.text?.[language] || questionMeta.text?.fr || questionKey,
            options: questionMeta.options?.[language] || questionMeta.options?.fr || [],
            feedback: questionData.firstAttemptCorrect
              ? questionMeta.feedback?.[language] || questionMeta.feedback?.fr
              : questionMeta.incorrectFeedback?.[language] || questionMeta.incorrectFeedback?.fr,
          };
        } else {
          console.warn(`[Resolver] Question metadata not found: ${questionKey}`);
          resolved.resolvedData = {
            questionText: questionKey,
            options: [],
          };
        }
        break;
      }

      case "procedure": {
        const procedureData = data as ProcedureInteractionData;
        const procedureKey = procedureData.procedureKey;
        if (!procedureKey) {
          console.warn(`[Resolver] Missing procedureKey in procedure interaction`);
          return resolved;
        }

        const procedureMeta = objectMetadata[procedureKey];
        if (procedureMeta) {
          resolved.resolvedData = {
            procedureTitle: procedureMeta.title?.[language] || procedureMeta.title?.fr || procedureKey,
            procedureDescription: procedureMeta.description?.[language] || procedureMeta.description?.fr,
            steps: (procedureData.steps || []).map((step: ProcedureStepAnalyticsData) => {
              const stepMeta = procedureMeta[step.stepKey];
              return {
                stepNumber: step.stepNumber,
                title: stepMeta?.title?.[language] || stepMeta?.title?.fr || step.stepKey,
                instruction: stepMeta?.instruction?.[language] || stepMeta?.instruction?.fr || "",
                hint: stepMeta?.hint?.[language] || stepMeta?.hint?.fr,
              };
            }),
          };
        } else {
          console.warn(`[Resolver] Procedure metadata not found: ${procedureKey}`);
          resolved.resolvedData = {
            procedureTitle: procedureKey,
            steps: [],
          };
        }
        break;
      }

      case "text": {
        const textData = data as TextInteractionData;
        const contentKey = textData.contentKey;
        if (!contentKey) {
          console.warn(`[Resolver] Missing contentKey in text interaction`);
          return resolved;
        }

        const textMeta = objectMetadata[contentKey];
        if (textMeta) {
          resolved.resolvedData = {
            textTitle: textMeta.title?.[language] || textMeta.title?.fr || contentKey,
            textSubtitle: textMeta.subtitle?.[language] || textMeta.subtitle?.fr,
            textContent: textMeta.content?.[language] || textMeta.content?.fr,
          };
        } else {
          console.warn(`[Resolver] Text metadata not found: ${contentKey}`);
          resolved.resolvedData = {
            textTitle: contentKey,
          };
        }
        break;
      }

      default:
        console.warn(`[Resolver] Unknown interaction type: ${interaction.type}`);
    }
  } catch (error) {
    console.error("[Resolver] Error resolving interaction:", error);
  }

  return resolved;
}

/**
 * Enrichit un tableau d'analytics avec les métadonnées localisées
 */
export function enrichAnalyticsWithMetadata<T extends { buildName: string; interactions: InteractionData[] }>(
  analytics: T[],
  metadataMap: Map<string, FormationMetadata>,
  language: string = "fr"
): T[] {
  return analytics.map((session) => {
    const metadata = metadataMap.get(session.buildName);

    if (!metadata) {
      console.warn(`[Enricher] No metadata for build: ${session.buildName}`);
      return session;
    }

    return {
      ...session,
      interactions: (session.interactions || []).map((interaction: InteractionData) =>
        resolveInteractionText(interaction, metadata, language)
      ),
    };
  });
}
