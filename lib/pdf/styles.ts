import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: "Helvetica",
        fontSize: 10,
        color: "#1e293b",
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 20,
        borderBottom: "1pt solid #e2e8f0",
        paddingBottom: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#0f172a",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: "#64748b",
    },
    section: {
        marginTop: 15,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#0f172a",
        borderBottom: "0.5pt solid #cbd5e1",
        marginBottom: 8,
        paddingBottom: 2,
        textTransform: "uppercase",
    },
    item: {
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },
    company: {
        fontSize: 11,
        fontWeight: "bold",
    },
    date: {
        fontSize: 9,
        color: "#64748b",
    },
    jobTitle: {
        fontSize: 10,
        fontWeight: "medium",
        color: "#475569",
        fontStyle: "italic",
        marginBottom: 4,
    },
    bullet: {
        flexDirection: "row",
        marginBottom: 3,
        paddingLeft: 10,
    },
    bulletDot: {
        width: 10,
    },
    bulletText: {
        flex: 1,
    },
    skillList: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 5,
    },
    skillBadge: {
        backgroundColor: "#f1f5f9",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontSize: 8,
        color: "#475569",
    },
    // Comparison specific
    scoreGrid: {
        flexDirection: "row",
        gap: 20,
        marginBottom: 20,
        backgroundColor: "#f8fafc",
        padding: 15,
        borderRadius: 8,
    },
    scoreItem: {
        flex: 1,
    },
    scoreLabel: {
        fontSize: 8,
        color: "#64748b",
        marginBottom: 2,
    },
    scoreValue: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#0f172a",
    },
    comparisonRow: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 10,
        borderBottom: "0.5pt solid #f1f5f9",
        paddingBottom: 10,
    },
    comparisonCol: {
        flex: 1,
    },
    colHeader: {
        fontSize: 9,
        fontWeight: "bold",
        color: "#64748b",
        marginBottom: 5,
        textTransform: "uppercase",
    },
    originalBullet: {
        fontSize: 9,
        color: "#94a3b8",
    },
    tailoredBullet: {
        fontSize: 10,
        color: "#1e293b",
        backgroundColor: "#f0fdf4",
        padding: 4,
        borderRadius: 4,
    },
    reason: {
        fontSize: 8,
        color: "#059669",
        marginTop: 4,
        fontStyle: "italic",
    },
    disclaimer: {
        marginTop: 30,
        padding: 10,
        backgroundColor: "#fff7ed",
        border: "0.5pt solid #fed7aa",
        borderRadius: 4,
        fontSize: 8,
        color: "#9a3412",
        textAlign: "center",
    },
});
