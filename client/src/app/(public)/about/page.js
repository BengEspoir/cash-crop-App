"use client";

import { PageHeader } from "../../../components/common/PageHeader";
import { useI18n } from "../../../i18n/I18nProvider";

export default function AboutPage() {
  const { t } = useI18n();
  return (
    <section className="space-y-6">
      <PageHeader eyebrow={t("common.aboutUs")} title={t("pages.about.title")} description={t("pages.about.description")} />
    </section>
  );
}
