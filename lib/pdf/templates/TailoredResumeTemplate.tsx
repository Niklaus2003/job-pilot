import React from "react";
import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import { TailoredResume, ResumeProfile } from "../../schemas";

interface Props {
    tailoredResume: TailoredResume;
    resumeProfile: ResumeProfile;
}

export const TailoredResumeTemplate = ({ tailoredResume, resumeProfile }: Props) => {
    const contact = resumeProfile.contact;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>{contact?.name || "Resume"}</Text>
                    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 4 }}>
                        {contact?.email && <Text style={styles.subtitle}>{contact.email}</Text>}
                        {contact?.phone && <Text style={styles.subtitle}>{contact.phone}</Text>}
                        {contact?.location && <Text style={styles.subtitle}>{contact.location}</Text>}
                    </View>
                    <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 2 }}>
                        {contact?.linkedin && <Text style={styles.subtitle}>LinkedIn: {contact.linkedin}</Text>}
                        {contact?.github && <Text style={styles.subtitle}>GitHub: {contact.github}</Text>}
                    </View>
                </View>

                {/* Summary */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <Text>{tailoredResume.tailoredSummary || resumeProfile.summary}</Text>
                </View>

                {/* Experience */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Experience</Text>
                    {tailoredResume.tailoredExperience.map((exp, idx) => (
                        <View key={idx} style={styles.item}>
                            <View style={styles.itemHeader}>
                                <Text style={styles.company}>{exp.company}</Text>
                            </View>
                            <Text style={styles.jobTitle}>{exp.title}</Text>
                            {exp.bullets.map((bullet, bIdx) => (
                                <View key={bIdx} style={styles.bullet}>
                                    <Text style={styles.bulletDot}>•</Text>
                                    <Text style={styles.bulletText}>{bullet.tailored}</Text>
                                </View>
                            ))}
                        </View>
                    ))}
                </View>

                {/* Skills */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Skills</Text>
                    <View style={styles.skillList}>
                        {(tailoredResume.tailoredSkills || resumeProfile.skills).map((skill, i) => (
                            <View key={i} style={styles.skillBadge}>
                                <Text>{skill}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Education (from original profile) */}
                {resumeProfile.education && resumeProfile.education.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {resumeProfile.education.map((edu, i) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.company}>{edu.institution}</Text>
                                    <Text style={styles.date}>{edu.dates}</Text>
                                </View>
                                <Text style={styles.jobTitle}>{edu.degree}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </Page>
        </Document>
    );
};
